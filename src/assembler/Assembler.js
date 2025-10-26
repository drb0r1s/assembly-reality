import { Tokenizer } from "./Tokenizer";
import { AST } from "./AST";
import { Instructions } from "./Instructions";
import { Memory } from "./Memory";

export class Assembler {
    constructor() {
        this.memory = new Memory();
        this.halted = false; // End the assembling of the code.
    }
    
    assemble(text) {
        const tokens = Tokenizer.tokenize(text);
        const ast = AST.build(tokens);
        console.log(ast)

        if(this.memory.free.i !== 0 || this.memory.free.j !== 0) this.memory.reset(); // We need to clean the memory before assembling the code.

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