import { AssemblerError } from "../AssemblerError";

const CONSTANT_LENGTHS = {
    "register": 1,
    "half.register": 1,
    "memory.register": 2,
    "memory.number.decimal": 2,
    "memory.number.binary": 2,
    "memory.number.octal": 2,
    "memory.number.hex": 2,
    "label.reference": 2,
    "memory.label.reference": 2
};

const VARIABLE_LENGTHS = {
    "number.decimal": true,
    "number.binary": true,
    "number.octal": true,
    "number.hex": true,
};

export const LengthOf = {
    noOperands: () => 1,

    oneOperand: instruction => {
        if(instruction.operands.length !== 1) throw new AssemblerError("InvalidNumberOfOperands", { name: instruction.name, operands: 1 }, instruction.line);

        const instructionLength = 1;

        const operand = instruction.operands[0];
        const operandLength = getLength(operand, instruction.isHalf);

        return instructionLength + operandLength;
    },

    twoOperands: instruction => {
        const operands = instruction.operands.filter(operand => operand.type !== "Separator");
        if(operands.length !== 2) throw new AssemblerError("InvalidNumberOfOperands", { name: instruction.name, operands: 2 }, instruction.line);

        if(instruction.operands[1].type !== "Separator") throw new AssemblerError("MissingSeparator", { name: instruction.name }, instruction.line);

        const instructionLength = 1;

        const firstLength = getLength(instruction.operands[0], instruction.isHalf);
        const secondLength = getLength(instruction.operands[2], instruction.isHalf);

        return instructionLength + firstLength + secondLength;
    }
};

function getLength(operand, isHalf) {
    if(VARIABLE_LENGTHS[operand.valueType]) return isHalf ? 1 : 2;
    return CONSTANT_LENGTHS[operand.valueType];
}