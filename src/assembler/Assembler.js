import { AssemblerError } from "./AssemblerError";
import { Registers } from "./Registers";
import { Memory } from "./Memory";
import { Labels } from "./Labels";
import { Tokenizer } from "./frontend/Tokenizer";
import { AST } from "./frontend/AST";
import { Instructions } from "./frontend/Instructions";
import { Executor } from "./backend/Executor";

export class Assembler {
    constructor() {
        this.registers = new Registers();
        this.memory = new Memory();
        this.labels = new Labels();
        this.halted = false; // End the assembling of the code.
    }
    
    assemble(text) {
        const tokens = Tokenizer.tokenize(text);
        let ast = AST.build(tokens);

        this.reset(); // We need to reset assembler before reassembling the code.

        // Here we proceed to go through the AST twice:
        // Pass 1: Simulate the memory shape, for assignment of addresses to labels.
        // Pass 2: Actual assembling of instructions.

        // Pass 1
        for(let i = 0; i < ast.statements.length; i++) this.observeStatement(ast.statements[i]);

        try {
            ast = this.labels.transform(ast);
        }

        catch(error) {
            if(error instanceof AssemblerError) return { error };
            else console.error(error);
        }

        this.memory.reset(); // We need to free the memory, free pointer need to be set to 0.

        // Pass 2
        for(let i = 0; i < ast.statements.length; i++) {
            try {
                this.assembleStatement(ast.statements[i]);
            }

            catch(error) {
                if(error instanceof AssemblerError) return { error };
                else console.error(error);
            }
        }

        console.log(ast, this.labels)

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
    }

    assembleStatement(statement) {
        if(statement.type === "Instruction") {
            let assembledCode = "";
            const instructionMethod = Instructions[statement.name];

            if(instructionMethod) assembledCode = instructionMethod(statement);
            else throw new AssemblerError("UnknownInstruction", { name: statement.name }, statement.line);

            if(assembledCode) this.memory.write(assembledCode);
        }
    }

    execute() {
        while(true) {
            if(this.memory.execution.i === this.memory.free.i && this.memory.execution.j === this.memory.free.j) break;

            const cell = this.memory.matrix[this.memory.execution.i][this.memory.execution.j];
            
            try {
                this.executeInstruction(cell);
            }

            catch(error) {
                if(error instanceof AssemblerError) return { error };
                else console.error(error);
            }

            // For infinite loop prevention, in case of bugs.
            if(this.memory.execution.i > this.memory.matrix.length) break;
        }

        return this;
    }

    executeInstruction(cell) {
        const executable = Executor.codes[cell];
        if(!executable) throw new AssemblerError("UnknownInstructionCode", { code: cell });

        const start = { i: this.memory.execution.i, j: this.memory.execution.j };

        this.memory.execution.j += executable.length;

        if(this.memory.execution.j > 15) {
            this.memory.execution.i++;
            this.memory.execution.j -= 16;
        }

        const args = this.collectArgs(start);
        Executor[executable.instruction](this, executable, args);
    }

    collectArgs(start) {
        const args = [];
        const positions = {...start};

        while(true) {
            if(positions.i === this.memory.execution.i && positions.j === this.memory.execution.j) break;

            args.push(this.memory.matrix[positions.i][positions.j]);

            if(positions.j === 15) {
                positions.i++;
                positions.j = 0;
            }

            else positions.j++;

            // For infinite loop prevention, in case of bugs.
            if(positions.i > this.memory.matrix.length) break;
        }

        args.shift(); // We want to remove the first argument, because it is the instruction code, which is already known.
        return args;
    }

    copy(assembler) {
        this.registers.copy(assembler.registers);
        this.memory.copy(assembler.memory);
        this.halted = assembler.halted;
    }

    reset() {
        this.registers.reset();
        this.memory.reset();
        this.halted = false;

        return this;
    }
};