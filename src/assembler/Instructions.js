import { AssemblerError } from "./Assembler";
import { InstructionSet } from "./InstructionSet";
import { registerIndexes } from "./registerIndexes";

export const Instructions = {
    HLT: instruction => {
        const instructionCode = InstructionSet[instruction.name]();
        return instructionCode;
    },

    MOV: instruction => {
        const operands = instruction.operands.filter(operand => operand.type !== "Separator");
        if(operands.length !== 2) throw new AssemblerError("InvalidNumberOfOperands", { name: instruction.name, operands: 2 }, instruction.line);

        const instructionCode = InstructionSet[instruction.name](instruction, operands);

        if(instruction.operands[1].type !== "Separator") throw new AssemblerError("MissingSeparator", { name: instruction.name }, instruction.line);

        const dest = operands[0];
        const src = operands[1];

        const destCode = parseType(instruction, dest);
        const srcCode = parseType(instruction, src);

        return instructionCode + destCode + srcCode;
    },

    MOVB: instruction => {
        const operands = instruction.operands.filter(operand => operand.type !== "Separator");
        if(operands.length !== 2) throw new AssemblerError("InvalidNumberOfOperands", { name: instruction.name, operands: 2 }, instruction.line);

        const instructionCode = InstructionSet[instruction.name](instruction, operands);

        if(instruction.operands[1].type !== "Separator") throw new AssemblerError("MissingSeparator", { name: instruction.name }, instruction.line);

        const dest = operands[0];
        const src = operands[1];

        const destCode = parseType(instruction, dest, { isHalf: true });
        const srcCode = parseType(instruction, src, { isHalf: true });

        return instructionCode + destCode + srcCode;
    },

    ADD: instruction => {
        const operands = instruction.operands.filter(operand => operand.type !== "Separator");
        if(operands.length !== 2) throw new AssemblerError("InvalidNumberOfOperands", { name: instruction.name, operands: 2 }, instruction.line);

        const instructionCode = InstructionSet[instruction.name](instruction, operands);

        if(instruction.operands[1].type !== "Separator") throw new AssemblerError("MissingSeparator", { name: instruction.name }, instruction.line);

        const dest = operands[0];
        const src = operands[1];

        const destCode = parseType(instruction, dest);
        const srcCode = parseType(instruction, src);

        return instructionCode + destCode + srcCode;
    },

    ADDB: instruction => {
        const operands = instruction.operands.filter(operand => operand.type !== "Separator");
        if(operands.length !== 2) throw new AssemblerError("InvalidNumberOfOperands", { name: instruction.name, operands: 2 }, instruction.line);

        const instructionCode = InstructionSet[instruction.name](instruction, operands);

        if(instruction.operands[1].type !== "Separator") throw new AssemblerError("MissingSeparator", { name: instruction.name }, instruction.line);

        const dest = operands[0];
        const src = operands[1];

        const destCode = parseType(instruction, dest, { isHalf: true });
        const srcCode = parseType(instruction, src, { isHalf: true });

        return instructionCode + destCode + srcCode;
    }
};

function parseType(instruction, operand, options) {
    const data = {
        codeLength: options?.isHalf ? 2 : 4,
        maxValue: options?.isHalf ? 255 : 65535,
        bits: options?.isHalf ? 8 : 16
    };

    let codeLength = 4; // 16-bit
    if(options?.isHalf) codeLength = 2; // 8-bit
    
    switch(operand.valueType) {
        case "register": return registerIndexes[operand.value];
        case "half.register": return registerIndexes[operand.value];
        case "memory.register": return "00" + registerIndexes[operand.value];
        case "memory.half.register": return registerIndexes[operand.value];
        case "memory.number.hex": return operand.value.toUpperCase().padStart(4, "0");
        case "number.decimal":
            if(operand.value > data.maxValue) throw new AssemblerError(`DecimalLimit${data.bits}`, {}, instruction.line);
            return parseInt(operand.value).toString(16).toUpperCase().padStart(data.codeLength, "0");
        case "number.hex":
            if(parseInt(`0x${operand.value}`) > data.maxValue) throw new AssemblerError(`HexLimit${data.bits}`, {}, instruction.line);
            return operand.value.toUpperCase().padStart(data.codeLength, "0");
        default: throw new AssemblerError("InvalidOperand", { operand: operand.value, instruction: instruction.name }, instruction.line);
    }
}