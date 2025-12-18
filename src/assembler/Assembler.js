import { AssemblerError } from "./AssemblerError";
import { CPURegisters } from "./CPURegisters";
import { IORegisters } from "./IORegisters";
import { RAM } from "./RAM";
import { Labels } from "./Labels";
import { Graphics } from "./Graphics";
import { Tokenizer } from "./frontend/Tokenizer";
import { AST } from "./frontend/AST";
import { Instructions } from "./frontend/Instructions";
import { Instants } from "./frontend/Instants";
import { Executor } from "./backend/Executor";
import { Interrupts } from "./Interrupts";

export class Assembler {
    constructor(cpuRegistersBuffer, ioRegistersBuffer, ramBuffer, graphicsBuffer) {
        this.speed = 4; // Default speed (4Hz).
        this.isHalted = false; // End the executing of the code.
        this.isTimerActive = false;
        this.cpuRegisters = new CPURegisters(cpuRegistersBuffer);
        this.ioRegisters = new IORegisters(ioRegistersBuffer);
        this.ram = new RAM(ramBuffer);
        this.labels = new Labels();
        this.graphics = new Graphics(graphicsBuffer);
        this.intervalId = null;
    }
    
    assemble(text) {
        try {
            const tokens = Tokenizer.tokenize(text);
            let ast = AST.build(tokens);

            this.reset(); // We need to reset assembler before reassembling the code.

            // Here we proceed to go through the AST twice:
            // Pass 1: Simulate the memory shape, for assignment of addresses to labels.
            // Pass 2: Actual assembling of instructions.

            // Pass 1
            for(let i = 0; i < ast.statements.length; i++) this.observeStatement(ast.statements[i]);
            
            ast = this.labels.transform(ast);
            this.ram.reset(); // We need to free the memory, free pointer need to be set to 0.

            // Pass 2
            for(let i = 0; i < ast.statements.length; i++) this.assembleStatement(ast.statements[i]);
        
            this.cpuRegisters.update("IP", this.ram.instructions[0]);

            console.log(ast, this.labels);
        }

        catch(error) {
            if(error instanceof AssemblerError) return { error };
            else console.error(error);
        }

        return {
            ram: {
                instructions: this.ram.instructions,
                stackStart: this.ram.stackStart
            }
        };
    }

    observeStatement(statement) {
        if(statement.type === "Label") {
            this.labels.collect(statement, this.ram);
        }

        if(statement.type === "Instruction") {
            const lengthOfInstruction = Instructions[statement.name](statement, { getLength: true });
            this.ram.advance(lengthOfInstruction);
        }

        if(statement.type === "Instant") {
            // ORG is the special type of instant, we need to rely on the actual implementation of the instant here to get the correct shape.
            if(statement.name === "ORG") Instants.ORG(this, statement);

            else {
                const operand = statement.operands[0];
                let lengthOfInstant = 0;

                // In case we need to write strings in memory, we need to get the length of the string.
                // However, if we want to use 16-bit value for each character (DW), then the shape of the instant in memory is going to be twice the length of the string.
                if(operand.valueType === "string.double") lengthOfInstant = statement.name === "DW" ? 2 * operand.value.length : operand.value.length;
                else lengthOfInstant = statement.isHalf ? 1 : 2;

                this.ram.advance(lengthOfInstant);
            }
        }
    }

    assembleStatement(statement) {
        if(statement.type === "Instruction") {
            let assembledCells = null;
            const instructionMethod = Instructions[statement.name];

            if(instructionMethod) assembledCells = instructionMethod(statement);
            else throw new AssemblerError("UnknownInstruction", { name: statement.name }, statement.line);

            if(assembledCells) {
                this.ram.addInstruction();
                this.ram.write(assembledCells);
            }
        }

        if(statement.type === "Instant") {
            const instantMethod = Instants[statement.name];

            if(instantMethod) instantMethod(this, statement);
            else throw new AssemblerError("UnknownInstant", { name: statement.name }, statement.line);
        }
    }

    execute(speed) {
        this.speed = speed;

        return new Promise((resolve, reject) => {
            let instructionCounter = 0;

            this.setAssemblerInterval(() => {                
                // The end of instruction execution is reached only if one of two cases:
                if(
                    (this.ram.instructions.indexOf(this.cpuRegisters.getValue("IP")) === -1) || // The Instruction Pointer (IP) has visited every instruction and jumped out of the instructions array (because there was no HLT at the end to stop it).
                    this.isHalted // The Instruction Pointer (IP) has reached the instruction HLT, meaning the execution stops immediately.
                ) {
                    const mFlag = (this.cpuRegisters.getValue("SR") >> 4) & 1;
                    if(this.isTimerActive && mFlag) return Interrupts.checkTimer(this);
                    
                    clearInterval(this.intervalId);
                    resolve(this.getAssemblerState());

                    return;
                }

                const [row, column] = this.ram.matrix.getLocation(this.cpuRegisters.getValue("IP"));
                const cell = this.ram.matrix.getCell(row, column);

                try {
                    if(!this.isHalted) this.executeInstruction(cell, instructionCounter);
                }

                catch(error) {
                    if(error instanceof AssemblerError) resolve({ error });
                    else reject(error);
                }

                instructionCounter++;

                Interrupts.checkTimer(this);
            });
        });
    }

    executeOne() {
        const [row, column] = this.ram.matrix.getLocation(this.cpuRegisters.getValue("IP"));
        const cell = this.ram.matrix.getCell(row, column);

        try {
            if(!this.isHalted) this.executeInstruction(cell);
        }

        catch(error) {
            if(error instanceof AssemblerError) return { error };
            else console.error(error);
        }

        return this.getAssemblerState();
    }

    executeInstruction(cell, instructionCounter = null) {
        const executable = Executor.codes[cell];
        if(!executable) throw new AssemblerError("UnknownInstructionCode", { code: cell });

        const args = this.collectArgs(executable.length);
        const oldAddress = this.cpuRegisters.getValue("IP");

        Executor[executable.instruction](this, executable, args);

        this.nextInstruction(executable, oldAddress);

        const updatesPerSecond = 10;
        
        // If instructionCounter is defined, that means that we're in a "running" mode.
        if(instructionCounter) {
            let updatePerInstructions = Math.floor(this.speed / updatesPerSecond);
            if (updatePerInstructions < 1) updatePerInstructions = 1;

            if(instructionCounter % updatePerInstructions === 0) self.postMessage({ action: "instructionExecuted", data: this.getAssemblerState() });
        }

        // Otherwise, we're just executing one instruction ("step" mode).
        else self.postMessage({ action: "instructionExecuted", data: this.getAssemblerState() });
    }

    // After the instruction is executed, we need to move the instruction pointer to the next instruction in the memory.instructions array.
    // However, if executed instruction was a halt, jump, function call, function return, or interrupt return, we shouldn't move the instruction pointer.
    nextInstruction(executable, oldAddress) {
        const jumpInstructions = ["JMP", "JC", "JB", "JNAE", "JNC", "JAE", "JNB", "JZ", "JE", "JNZ", "JNE", "JA", "JNBE", "JNA", "JBE", "CALL", "RET", "IRET"];

        if(
            executable.instruction === "HLT" ||
            (jumpInstructions.indexOf(executable.instruction) > -1 && this.cpuRegisters.getValue("IP") !== oldAddress)
        ) return;

        const instructionIndex = this.ram.instructions.indexOf(this.cpuRegisters.getValue("IP"));

        if(instructionIndex === this.ram.instructions.length - 1) this.cpuRegisters.update("IP", this.ram.matrix.getAddress(this.ram.free.i, this.ram.free.j));
        else this.cpuRegisters.update("IP", this.ram.instructions[instructionIndex + 1]);
    }

    pause() {
        if(!this.intervalId) return;

        clearInterval(this.intervalId);
        return this.getAssemblerState();
    }

    collectArgs(length) {
        const args = [];
        
        let [row, column] = this.ram.matrix.getLocation(this.cpuRegisters.getValue("IP"));
        
        for(let i = 0; i < length; i++) {
            args.push(this.ram.matrix.getCell(row, column));

            column++;

            if(column > 15) {
                column = 0;
                row++;
            }
        }

        args.shift(); // We want to remove the first argument, because it is the instruction code, which is already known.
        return args;
    }

    setAssemblerInterval(callback) {
        const delay = 1000 / this.speed; // ms per instruction

        // High speeds (> 1kHz) require < 1ms per instruction, which is not possible in browser.
        // As a solution to that, we're going to execute multiple instructions at once, to simulate that < 1ms speed.
        const isHighSpeed = this.speed > 1000;

        if(this.intervalId) clearInterval(this.intervalId);

        if(isHighSpeed) {
            let prevNow = performance.now();
            let leftover = 0;

            // Here we do not want to call one callback immediately, like we do for low speeds.
            this.intervalId = setInterval(() => {
                const now = performance.now();

                const passedTime = now - prevNow;
                prevNow = now;

                // This constant uses the formula to calculate instructions per clock cycle, with respect to leftovers.
                const numberOfInstructions = (passedTime * this.speed) / 1000 + leftover;
                let instructionsToExecute = Math.floor(numberOfInstructions);

                leftover = numberOfInstructions - instructionsToExecute;

                if(instructionsToExecute <= 0) return;

                // In general, relation between speed and clock cycles is calculated to be approx. speed / 100 = clock cycle.
                // Because of that, we will rely on this constant to speed up the execution if instructionsToExecute is too high.
                const speedToClockCycleRatio = this.speed / 100;

                while(instructionsToExecute > 0) {
                    // There is a possibility that calculated real instructions per clock cycle (instructionsToExecute) are not fast enough for our simulation.
                    // Because of that, as mentioned above, we use speedToClockCycleRatio.
                    const executedInstructions = Math.min(speedToClockCycleRatio, instructionsToExecute);
                    for(let i = 0; i < executedInstructions; i++) callback();

                    instructionsToExecute -= executedInstructions;
                }
            }, 1);
        }

        else {
            // The first iteration.
            callback();
            this.intervalId = setInterval(callback, delay);
        }
    }

    getAssemblerState() {
        // If speed is too high (over 10kHz), we won't update cpuRegisters and memory.
        if(this.speed < 10000) return {
            ram: {
                instructions: this.ram.instructions,
                stackStart: this.ram.stackStart
            }
        };

        return {};
    }

    reset() {
        this.speed = 4;
        this.isHalted = false;
        this.isTimerActive = false;
        this.cpuRegisters.reset();
        this.ioRegisters.reset();
        this.ram.reset();
        this.graphics.reset();
        this.labels.reset();
        
        clearInterval(this.intervalId);
        this.intervalId = null;
    }
};