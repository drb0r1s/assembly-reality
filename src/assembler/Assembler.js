import { AssemblerError } from "./AssemblerError";
import { CPURegisters } from "./components/CPURegisters";
import { IORegisters } from "./components/IORegisters";
import { RAM } from "./components/RAM";
import { Graphics } from "./components/Graphics";
import { Keyboard } from "./components/Keyboard";
import { Tokenizer } from "./frontend/Tokenizer";
import { AST } from "./frontend/AST";
import { Instructions } from "./frontend/Instructions";
import { Instants } from "./frontend/Instants";
import { Labels } from "./frontend/Labels";
import { Lines } from "./frontend/Lines";
import { Executor } from "./backend/Executor";
import { Refresh } from "./structures/Refresh";
import { ExecutionInterval } from "./structures/ExecutionInterval";
import { Interrupts } from "./helpers/Interrupts";

const jumpInstructions = new Set(["JMP", "JC", "JB", "JNAE", "JNC", "JAE", "JNB", "JZ", "JE", "JNZ", "JNE", "JA", "JNBE", "JNA", "JBE", "CALL", "RET", "IRET"]);

export class Assembler {
    constructor(cpuRegistersBuffer, ioRegistersBuffer, ramBuffer, graphicsBuffer) {
        this.speed = 4; // Default speed (4Hz).
        this.cpuRegisters = new CPURegisters(cpuRegistersBuffer);
        this.ioRegisters = new IORegisters(ioRegistersBuffer);
        this.ram = new RAM(ramBuffer);
        this.graphics = new Graphics(this, graphicsBuffer);
        this.labels = new Labels();
        this.lines = new Lines();
        this.interrupts = new Interrupts(this);
        this.keyboard = new Keyboard(this.ioRegisters, this.interrupts);
        this.refresh = new Refresh(this);
        this.executionInterval = new ExecutionInterval(() => this.speed);
        this.instants = new Instants(this.ram);
        this.executor = new Executor(this);
    }

    isActive() {
        const hFlag = this.cpuRegisters.getSRFlag("H");
        return hFlag === 0;
    }

    activate() {
        this.cpuRegisters.updateSR({ H: 0 });
    }

    deactivate() {
        this.cpuRegisters.updateSR({ H: 1 });
        // Sometimes assembler can be halted, but slow elements (RAM and CPU Registers) are not up-to-date.
        // It's important that we trigger one more slow update, just in case, to make everything synchronous.
        this.refresh.triggerSlow();
    }
    
    assemble(text) {
        try {
            if(text === null || text === undefined || text?.length === 0) return;

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
        }

        catch(error) {
            if(error instanceof AssemblerError) return { error };
            return { error: new AssemblerError("SyntaxError") };
        }

        return {
            cpuRegisters: {
                collection: this.cpuRegisters.collection
            },

            ram: {
                instructions: this.ram.instructions,
                stackStart: this.ram.stackStart
            },

            lines: {
                collection: this.lines.collection
            }
        };
    }

    observeStatement(statement) {
        if(statement.type === "Label") {
            this.labels.collect(statement, this.ram);
        }

        if(statement.type === "Instruction") {
            const lengthOfInstruction = Instructions[statement.name](statement, true);
            
            this.cpuRegisters.collect(statement.operands, this.ram, lengthOfInstruction); // Looking for A, B, C, D registers.
            this.lines.collect(statement.line, this.ram);
            this.ram.advance(lengthOfInstruction);
        }

        if(statement.type === "Instant") {
            // ORG is a special type of instant, we need to rely on the actual implementation of the instant here to get the correct shape.
            if(statement.name === "ORG") this.instants.ORG(statement);
            // DB is a special type of instant, because of its ability to use special character \ for Exact Mode.
            // Therefore, we need to actually compute the value of .DB in order to get the proper movement of free pointers.
            else if(statement.name === "DB") this.instants.DB(statement);

            // DW
            else {
                const operand = statement.operands[0];
                let lengthOfInstant = 0;

                // In case we need to write strings in memory, we need to get the length of the string.
                // However, if we want to use 16-bit value for each character (DW), then the shape of the instant in memory is going to be twice the length of the string.
                if(operand.valueType === "string.double") lengthOfInstant = 2 * operand.value.length;
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
            const instantMethod = this.instants[statement.name];

            if(instantMethod) instantMethod(statement);
            else throw new AssemblerError("UnknownInstant", { name: statement.name }, statement.line);
        }
    }

    execute(speed) {
        this.speed = speed;

        this.refresh.startInterval();

        return new Promise(resolve => {
            let instructionCounter = 0;

            this.executionInterval.start(() => {     
                const mFlag = this.cpuRegisters.getSRFlag("M");
                
                // The Instruction Pointer (IP) has reached the instruction HLT, meaning the execution stops immediately.
                // Note that execution will only stop if interrupts are disabled (M = 0), otherwise we won't stop the execution.
                if(!this.isActive() && !mFlag) {    
                    this.stop();
                    resolve({ executed: true });

                    return;
                }

                const IP = this.cpuRegisters.getValue("IP");
                const cell = this.ram.matrix.get(IP);

                try {
                    if(this.isActive()) this.executeInstruction(cell, instructionCounter);
                }

                catch(error) {
                    if(error instanceof AssemblerError) resolve({ error });

                    else {
                        this.stop();
                        resolve({ error: new AssemblerError("UnknownExecutionError") });

                        return;
                    }
                }

                instructionCounter++;

                this.interrupts.checkTimer();
            });
        });
    }

    executeOne() {
        if(!this.isActive()) return -1; // -1 = No line to be highlighted.

        const IP = this.ram.matrix.get(this.cpuRegisters.getValue("IP"));

        try {
            this.executeInstruction(IP);
        }

        catch(error) {
            if(error instanceof AssemblerError) return { error };
            return { error: new AssemblerError("UnknownExecutionError") };
        }

        return this.lines.collection[IP];
    }

    executeInstruction(cell, instructionCounter = null) {
        const executable = this.executor.codes[cell];
        if(!executable) throw new AssemblerError("UnknownInstructionCode", { code: cell });

        const args = this.collectArgs(executable.length);
        const oldAddress = this.cpuRegisters.getValue("IP");

        this.executor[executable.instruction](executable, args);

        this.nextInstruction(executable, oldAddress);

        const updatesPerSecond = this.speed >= 10000 ? 2 : 4;

        // If instructionCounter is defined, that means that we're in a "running" mode.
        if(instructionCounter !== null) {
            let updatePerInstructions = Math.floor(this.speed / updatesPerSecond);
            if(updatePerInstructions < 1) updatePerInstructions = 1;

            if(instructionCounter % updatePerInstructions === 0) this.refresh.triggerSlow();
        }

        // Otherwise, we're just executing one instruction ("step" mode).
        else this.refresh.slow({ force: true, step: true });
    }

    // After the instruction is executed, we need to move the instruction pointer to the next instruction in the ram.instructions array.
    // However, if executed instruction was a halt, jump, function call, function return, or interrupt return, we shouldn't move the instruction pointer.
    nextInstruction(executable, oldAddress) {
        const IP = this.cpuRegisters.getValue("IP");
        
        if(
            executable.instruction === "HLT" ||
            (jumpInstructions.has(executable.instruction) && IP !== oldAddress)
        ) return;

        const instructionIndex = this.ram.instructions.indexOf(IP);

        if(instructionIndex === this.ram.instructions.length - 1) {
            this.deactivate();
            this.cpuRegisters.update("IP", this.ram.free);
        }
        
        else this.cpuRegisters.update("IP", this.ram.instructions[instructionIndex + 1]);
    }

    pause() {
        this.executionInterval.stop();
        this.refresh.stopInterval();

        return this.getAssemblerState();
    }

    stop() {
        this.executionInterval.stop();
        this.refresh.stopInterval();
    }

    isTimerActive() {
        const tmrPreload = this.ioRegisters.getValue("TMRPRELOAD");
        return tmrPreload !== 0;
    }

    collectArgs(length) {
        const args = [];
        
        // We'll skip the first address cell, because it is the instruction code, which is already known.
        let address = this.cpuRegisters.getValue("IP") + 1;
        
        for(let i = 1; i < length; i++) {
            args.push(this.ram.matrix.get(address));
            address++;
        }

        return args;
    }

    getAssemblerState() {
        return {
            ram: {
                instructions: this.ram.instructions,
                stackStart: this.ram.stackStart
            }
        };
    }

    reset() {
        this.speed = 4;
        this.cpuRegisters.reset();
        this.ioRegisters.reset();
        this.ram.reset();
        this.graphics.reset();
        this.labels.reset();
        this.lines.reset();
        this.keyboard.reset();
        this.refresh.reset();
        this.executionInterval.reset();
    }
};