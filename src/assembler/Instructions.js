import { AssemblerError } from "./Assembler";
import { InstructionSet } from "./InstructionSet";
import { registerIndexes } from "./registerIndexes";

export const Instructions = {
    HLT: instruction => {
        return Perform.noOperands(instruction);
    },

    MOV: instruction => {
        return Perform.twoOperands(instruction);
    },

    MOVB: instruction => {
        return Perform.twoOperands(instruction, { isHalf: true });
    },

    ADD: instruction => {
        return Perform.twoOperands(instruction);
    },

    ADDB: instruction => {
        return Perform.twoOperands(instruction, { isHalf: true });
    },

    SUB: instruction => {

    }
};

const Perform = {
    noOperands: instruction => {
        const instructionCode = InstructionSet[instruction.name]();
        return instructionCode;
    },
    
    twoOperands: (instruction, options) => {
        const operands = instruction.operands.filter(operand => operand.type !== "Separator");
        if(operands.length !== 2) throw new AssemblerError("InvalidNumberOfOperands", { name: instruction.name, operands: 2 }, instruction.line);

        const instructionCode = InstructionSet[instruction.name](instruction, operands);

        if(instruction.operands[1].type !== "Separator") throw new AssemblerError("MissingSeparator", { name: instruction.name }, instruction.line);

        const dest = operands[0];
        const src = operands[1];

        const destCode = parseType(instruction, dest, { isHalf: options?.isHalf ? options.isHalf : false });
        const srcCode = parseType(instruction, src, { isHalf: options?.isHalf ? options.isHalf : false });

        return instructionCode + destCode + srcCode;
    }
};

function parseType(instruction, operand, options) {
    // isHalf is used for 8-bit instructions
    const data = {
        codeLength: options?.isHalf ? 2 : 4,
        maxValue: options?.isHalf ? 255 : 65535,
        maxMemoryValue: 4127,
        bits: options?.isHalf ? 8 : 16
    };
    
    switch(operand.valueType) {
        case "register": return registerIndexes[operand.value];
        case "half.register": return registerIndexes[operand.value];
        case "memory.register": return "00" + registerIndexes[operand.value];
        case "memory.half.register": return registerIndexes[operand.value];
        case "memory.number.hex":
            if(parseInt(`0x${operand.value}`) > data.maxMemoryValue) throw new AssemblerError("HexMemoryLimit", {}, instruction.line);
            return operand.value.toUpperCase().padStart(4, "0");
        case "memory.number.decimal":
            if(parseInt(operand.value) > data.maxMemoryValue) throw new AssemblerError("DecimalMemoryLimit", {}, instruction.line);
            return parseInt(operand.value).toString(16).toUpperCase().padStart(4, "0");
        case "number.hex":
            if(parseInt(`0x${operand.value}`) > data.maxValue) throw new AssemblerError(`HexLimit${data.bits}`, {}, instruction.line);
            return operand.value.toUpperCase().padStart(data.codeLength, "0");
        case "number.decimal":
            if(parseInt(operand.value) > data.maxValue) throw new AssemblerError(`DecimalLimit${data.bits}`, {}, instruction.line);
            return parseInt(operand.value).toString(16).toUpperCase().padStart(data.codeLength, "0");
        default: throw new AssemblerError("InvalidOperand", { operand: operand.value, instruction: instruction.name }, instruction.line);
    }
}