import { Tokenizer } from "./Tokenizer";
import { AST } from "./AST";
import { InstructionSet } from "./InstructionSet";

export class Assembler {
    constructor() {
        this.memory = {
            matrix: Array.from({ length: 258 }, () => Array.from({ length: 16 }, () => "00")),
            free: { i: 0, j: 0 } // Pointers to the last free-memory coordinates.
        };

        this.halted = false; // End the assembling of the code.
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
                else console.error(error);
            }
        }

        return this.memory.matrix;
    }

    assembleInstruction(instruction) {
        let assembledCode = "";
        const instructionMethod = InstructionSet[instruction.name];

        if(instructionMethod) assembledCode = instructionMethod(instruction);
        else throw new AssemblerError("UnknownInstruction", { name: instruction.name }, instruction.line);

        if(assembledCode) this.memoryWrite(assembledCode);
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

            if(i > this.memory.matrix.length) throw new AssemblerError("OutOfMemory");
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

export class AssemblerError {
    constructor(type, attributes, line) {
        this.type = type;
        this.content = this.getContent(attributes);
        this.line = line ? line : null;
    }

    getContent(attributes) {
        switch(this.type) {
            case "UnknownInstruction": return `${attributes.name} is an unknown instruction!`;
            case "InvalidOperandsCombination": return `Combination of ${attributes.operands[0]} and ${attributes.operands[1]} operands is invalid for the ${attributes.instruction} instruction!`;
            case "InvalidOperand": return `Operand ${attributes.operand} is invalid for the ${attributes.instruction} instruction!`;
            case "InvalidNumberOfOperands": return `Instruction ${attributes.name} requires ${attributes.operands} operand${attributes.operands !== 1 ? "s" : ""}!`;
            case "MissingSeparator": return `The separator is missing for the ${attributes.name} instruction!`;
            case "DecimalLimit16": return "16-bit operand must have a value between 0 and 65535!";
            case "DecimalLimit8": return "8-bit operand must have a value between 0 and 255!";
            case "DecimalMemoryLimit": return "Decimal memory pointer operand must have a value between 0 and 4127!";
            case "HexLimit16": return "16-bit operand must have a value between 0x0000 and 0xFFFF!";
            case "HexLimit8": return "8-bit operand must have a value between 0x00 and 0xFF!";
            case "HexMemoryLimit": return "Hex memory pointer operand must have a value between 0x0000 and 0x101F!";
            case "OutOfMemory": return "Memory limit exceeded!";
        }
    }
};