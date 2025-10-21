import { Tokenizer } from "./Tokenizer";
import { AST } from "./AST";
import { Instructions } from "./Instructions";

export class AssemblerError {
    constructor(type, content) {
        this.type = type;
        this.content = content;
    }
}

export class Assembler {
    constructor() {
        this.memory = {
            matrix: Array.from({ length: 258 }, () => Array.from({ length: 16 }, () => "00")),
            free: { i: 0, j: 0 } // Pointers to the last free-memory coordinates.
        };
    }
    
    assemble(text) {
        const tokens = Tokenizer.tokenize(text);
        const ast = AST.build(tokens);
        console.log(ast)

        this.memoryReset(); // We need to clean the memory before assembling the code.

        for(let i = 0; i < ast.instructions.length; i++) {
            try {
                this.assembleInstruction(ast.instructions[i]);
            }

            catch(error) {
                if(error instanceof AssemblerError) return { error };
            }
        }

        return this.memory.matrix;
    }

    assembleInstruction(instruction) {
        let assembledCode = "";
        
        switch(instruction.name) {
            case "MOV":
                assembledCode = Instructions.MOV(instruction);
                break;
            default:
        }

        this.memoryWrite(assembledCode);
    }

    memoryWrite(hex) {
        let { i, j } = this.memory.free;
        const hexCells = hex.match(/.{1,2}/g); // Breaking hex string into groups of two digit numbers, to fit memory cells.

        for(let k = 0; k < hexCells.length; k++) {
            this.memory.matrix[i][j] = hexCells[k];

            if(j === 15) {
                i++;
                j = 0;
            }

            else j++;

            if(i > this.memory.matrix.length) throw new AssemblerError("OutOfMemory", "Memory limit exceeded!");
        }

        this.memory.free = { i, j }; // Updating last memory-free coordinates globally.

        if(this.onMemoryChange) this.onMemoryChange(this.memory.matrix);
    }

    memoryReset() {
        this.memory = {
            matrix: Array.from({ length: 258 }, () => Array.from({ length: 16 }, () => "00")),
            free: { i: 0, j: 0 } // Pointers to the last free-memory coordinates.
        }
    }
};