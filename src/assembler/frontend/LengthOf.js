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
        const instructionLength = 1;

        const operand = instruction.operands[0];
        const operandLength = getLength(operand, instruction.isHalf);

        return instructionLength + operandLength;
    },

    twoOperands: instruction => {
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