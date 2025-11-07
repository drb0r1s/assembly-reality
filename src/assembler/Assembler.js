import { AssemblerError } from "./AssemblerError";
import { Registers } from "./Registers";
import { Memory } from "./Memory";
import { Labels } from "./Labels";
import { Tokenizer } from "./frontend/Tokenizer";
import { AST } from "./frontend/AST";
import { Instructions } from "./frontend/Instructions";
import { Instants } from "./frontend/Instants";
import { Executor } from "./backend/Executor";

export class Assembler {
    constructor() {
        this.registers = new Registers();
        this.memory = new Memory();
        this.labels = new Labels();
        this.halted = false; // End the assembling of the code.
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
            this.memory.reset(); // We need to free the memory, free pointer need to be set to 0.

            // Pass 2
            for(let i = 0; i < ast.statements.length; i++) this.assembleStatement(ast.statements[i]);
        
            console.log(ast, this.labels);
        }

        catch(error) {
            if(error instanceof AssemblerError) return { error };
            else console.error(error);
        }

        return this.memory;
    }

    observeStatement(statement) {
        if(statement.type === "Label") {
            this.labels.collect(statement, this.memory);
        }

        if(statement.type === "Instruction") {
            const lengthOfInstruction = Instructions[statement.name](statement, { getLength: true });
            this.memory.advance(lengthOfInstruction);
        }

        if(statement.type === "Instant") {
            const lengthOfInstant = statement.isHalf ? 1 : 2;
            this.memory.advance(lengthOfInstant);
        }
    }

    assembleStatement(statement) {
        if(statement.type === "Instruction") {
            let assembledCells = null;
            const instructionMethod = Instructions[statement.name];

            if(instructionMethod) assembledCells = instructionMethod(statement);
            else throw new AssemblerError("UnknownInstruction", { name: statement.name }, statement.line);

            if(assembledCells) {
                this.memory.addInstruction();
                this.memory.write(assembledCells);
            }
        }

        if(statement.type === "Instant") {
            let assembledCells = null;
            const instantMethod = Instants[statement.name];

            if(instantMethod) assembledCells = instantMethod(statement);
            else throw new AssemblerError("UnknownInstant", { name: statement.name }, statement.line);

            if(assembledCells) this.memory.write(assembledCells);
        }
    }

    execute(speed) {
        return new Promise((resolve, reject) => {
            this.setAssemblerInterval(speed, () => {
                if(this.memory.instructionIndex === this.memory.instructions.length) {
                    clearInterval(this.intervalId);
                    resolve(this);

                    return;
                }

                const [row, column] = this.memory.getLocation(this.memory.getCurrentInstruction());
                const cell = this.memory.getMatrixCell(row, column);

                try {
                    this.executeInstruction(cell);
                }

                catch(error) {
                    if(error instanceof AssemblerError) reject(error);
                    else reject(error);
                }

                this.memory.nextInstruction();
            });
        });
    }

    executeInstruction(cell) {
        const executable = Executor.codes[cell];
        if(!executable) throw new AssemblerError("UnknownInstructionCode", { code: cell });

        const args = this.collectArgs(executable.length);
        Executor[executable.instruction](this, executable, args);

        self.postMessage({
            action: "instructionExecuted",
            data: this
        });
    }

    collectArgs(length) {
        const args = [];
        
        let [row, column] = this.memory.getLocation(this.memory.getCurrentInstruction());
        
        for(let i = 0; i < length; i++) {
            args.push(this.memory.getMatrixCell(row, column));

            column++;

            if(column > 15) {
                column = 0;
                row++;
            }
        }

        args.shift(); // We want to remove the first argument, because it is the instruction code, which is already known.
        return args;
    }

    setAssemblerInterval(speed, callback) {
        const delay = 1000 / speed; // ms per instruction

        // High speeds (> 1kHz) require < 1ms per instruction, which is not possible in browser.
        // As a solution to that, we're going to execute multiple instructions at once, to simulate that < 1ms speed.
        const isHighSpeed = speed > 1000;

        if(this.intervalId) clearInterval(this.intervalId);

        if(isHighSpeed) {
            const numberOfInstructions = Math.floor(speed / 1000);

            this.intervalId = setInterval(() => {
                for(let i = 0; i < numberOfInstructions; i++) callback();
            }, 1);
        }

        else this.intervalId = setInterval(callback, delay);
    }

    copy(assembler) {
        this.registers.copy(assembler.registers);
        this.memory.copy(assembler.memory);
        this.labels.copy(assembler.labels);
        this.halted = assembler.halted;
    }

    reset() {
        this.registers.reset();
        this.memory.reset();
        this.labels.reset();
        this.halted = false;

        return this;
    }
};