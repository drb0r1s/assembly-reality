import { Tokenizer } from "./Tokenizer";
import { AST } from "./AST";
import { Instructions } from "./Instructions";
import { Registers } from "./Registers";
import { Memory } from "./Memory";
import { Executor } from "./Executor";
import { AssemblerError } from "./AssemblerError";

export class Assembler {
    constructor() {
        this.registers = new Registers();
        this.memory = new Memory();
        this.halted = false; // End the assembling of the code.
    }
    
    assemble(text) {
        const tokens = Tokenizer.tokenize(text);
        const ast = AST.build(tokens);
        console.log(ast)

        this.reset(); // We need to reset the assembler before reassembling the code.

        for(let i = 0; i < ast.instructions.length; i++) {
            try {
                this.assembleInstruction(ast.instructions[i]);
            }

            catch(error) {
                if(error instanceof AssemblerError) return { error };
                else console.error(error);
            }
        }

        return this.memory.matrix;
    }

    assembleInstruction(instruction) {
        let assembledCode = "";
        const instructionMethod = Instructions[instruction.name];

        if(instructionMethod) assembledCode = instructionMethod(instruction);
        else throw new AssemblerError("UnknownInstruction", { name: instruction.name }, instruction.line);

        if(assembledCode) this.memory.write(assembledCode);
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

    reset() {
        this.registers.reset();
        this.memory.reset();
        this.halted = false;
    }
};