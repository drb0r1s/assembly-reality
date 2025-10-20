import { Tokenizer } from "./Tokenizer";
import { AST } from "./AST";
import { InstructionSet } from "./InstructionSet";
import { registerIndexes } from "./registerIndexes";

class AssemblerError {
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
        const operands = instruction.operands.filter(operand => operand.type !== "Separator");
        if(operands.length !== 2) throw new AssemblerError("InvalidOperands", `Instruction ${instruction.name} requires 2 operands!`);

        const instructionCode = InstructionSet[instruction.name](operands);
        if(!instructionCode) throw new AssemblerError("UnknownInstruction", `${instruction.name} is an unknown instruction!`);

        if(instruction.operands[1].type !== "Separator") throw new AssemblerError("MissingSeparator", `The separator is missing for the ${instruction.name} instruction!`);

        const dest = operands[0];
        const src = operands[1];

        let destCode = parseInt(dest.value).toString(16).toUpperCase().padStart(4, "0");
        let srcCode = parseInt(src.value).toString(16).toUpperCase().padStart(4, "0");

        if(dest.valueType === "register") destCode = registerIndexes[dest.value];
        if(src.valueType === "register") srcCode = registerIndexes[src.value];

        this.memoryWrite(instructionCode + destCode + srcCode);
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