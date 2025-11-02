export const LengthOf = {
    noOperands: () => 1,

    oneOperand: instruction => {
        const lengths = getLengths(instruction);
        const instructionLength = 1;

        const operand = instruction.operands[0];
        const operandLength = lengths[operand.valueType];

        return instructionLength + operandLength;
    },

    twoOperands: instruction => {
        const lengths = getLengths(instruction);
        const instructionLength = 1;

        const operands = instruction.operands.filter(operand => operand.type !== "Separator");

        const firstLength = lengths[operands[0].valueType];
        const secondLength = lengths[operands[1].valueType];

        return instructionLength + firstLength + secondLength;
    }
};

function getLengths(instruction) {
    return {
        "register": 1,
        "half.register": 1,
        "memory.register": 2,
        "memory.number.decimal": 2,
        "memory.number.hex": 2,
        "number.decimal": instruction.isHalf ? 1 : 2,
        "number.hex": instruction.isHalf ? 1 : 2,
        "label.reference": 2,
        "memory.label.reference": 2
    };
}