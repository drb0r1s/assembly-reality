import { AssemblerError } from "./Assembler";

/*
    Type examples:

    REG (Register): A,
    IND (Indirect addressing): [A],
    DIR (Direct addressing): [0x1000],
    IMD (Immediate value): 10
*/

export const InstructionSet = {
    HLT: () => {
        return "00";
    },
    
    // MOV operands: REG (register) || IND (memory.register) || DIR (memory.number.*) || IMD (number.*)
    MOV: (instruction, operands) => {
        const [first, second] = operands;

        const valueTypes = `${generalizeType(first.valueType)} ${generalizeType(second.valueType)}`;

        switch(valueTypes) {
            case "register register": return "01";
            case "register memory.register": return "02";
            case "register memory.half.register": return "02";
            case "register memory.number.*": return "03";
            case "memory.register register": return "04";
            case "memory.number.* register": return "05";
            case "register number.*": return "06";
            case "memory.register number.*": return "07";
            case "memory.number.* number.*": return "08";
            default: throw new AssemblerError("InvalidOperandsCombination", { operands: [first.value, second.value], instruction: instruction.name }, instruction.line);
        }
    },

    // MOVB operands: REG (half.register) || IND (memory.register. memory.half.register) || DIR (memory.number.*) || IMD (number.*)
    MOVB: (instruction, operands) => {
        const [first, second] = operands;

        const valueTypes = `${generalizeType(first.valueType)} ${generalizeType(second.valueType)}`;

        switch(valueTypes) {
            case "half.register half.register": return "09";
            case "half.register memory.register": return "0A";
            case "half.register memory.half.register": return "0A";
            case "half.register memory.number.*": return "0B";
            case "memory.register half.register": return "0C";
            case "memory.half.register half.register": return "0C";
            case "memory.number.* half.register": return "0D";
            case "half.register number.*": return "0E";
            case "memory.register number.*": return "0F";
            case "memory.half.register number.*": return "0F";
            case "memory.number.* number.*": return "10";
            default: throw new AssemblerError("InvalidOperandsCombination", { operands: [first.value, second.value], instruction: instruction.name }, instruction.line);
        }
    },

    // ADD operands: REG (register) || IND (memory.register) || DIR (memory.number.*) || IMD (number.*)
    ADD: (instruction, operands) => {
        const [first, second] = operands;

        const valueTypes = `${generalizeType(first.valueType)} ${generalizeType(second.valueType)}`;

        switch(valueTypes) {
            case "register register": return "11";
            case "register memory.register": return "12";
            case "register memory.number.*": return "13";
            case "register number.*": return "14";
            default: throw new AssemblerError("InvalidOperandsCombination", { operands: [first.value, second.value], instruction: instruction.name }, instruction.line);
        }
    },

    // ADDB operands: REG (half.register) || IND (memory.register, memory.half.register) || DIR (memory.number.*) || IMD (number.*)
    ADDB: (instruction, operands) => {
        const [first, second] = operands;

        const valueTypes = `${generalizeType(first.valueType)} ${generalizeType(second.valueType)}`;

        switch(valueTypes) {
            case "half.register half.register": return "15";
            case "half.register memory.register": return "16";
            case "half.register memory.half.register": return "16";
            case "half.register memory.number.*": return "17";
            case "half.register number.*": return "18";
            default: throw new AssemblerError("InvalidOperandsCombination", { operands: [first.value, second.value], instruction: instruction.name }, instruction.line);
        }
    },

    // SUB operands: REG (register) || IND (memory.register) || DIR (memory.number.*) || IMD (number.*)
    SUB: (instruction, operands) => {
        const [first, second] = operands;

        const valueTypes = `${generalizeType(first.valueType)} ${generalizeType(second.valueType)}`;

        switch(valueTypes) {
            case "register register": return "19";
            case "register memory.register": return "1A";
            case "register memory.number.*": return "1B";
            case "register number.*": return "1C";
            default: throw new AssemblerError("InvalidOperandsCombination", { operands: [first.value, second.value], instruction: instruction.name }, instruction.line);
        }
    },

    // SUBB operands: REG (half.register) || IND (memory.register, memory.half.register) || DIR (memory.number.*) || IMD (number.*)
    SUBB: (instruction, operands) => {
        const [first, second] = operands;

        const valueTypes = `${generalizeType(first.valueType)} ${generalizeType(second.valueType)}`;

        switch(valueTypes) {
            case "half.register half.register": return "1D";
            case "half.register memory.register": return "1E";
            case "half.register memory.half.register": return "1E";
            case "half.register memory.number.*": return "1F";
            case "half.register number.*": return "20";
            default: throw new AssemblerError("InvalidOperandsCombination", { operands: [first.value, second.value], instruction: instruction.name }, instruction.line);
        }
    },

    // INC operand: REG (register)
    INC: (instruction, operand) => {
        const [first] = operand;

        if(first.valueType === "register") return "21";
        else throw new AssemblerError("InvalidOperand", { operand: first.value, instruction: instruction.name }, instruction.line);
    },

    // INCB operand: REG (half.register)
    INCB: (instruction, operand) => {
        const [first] = operand;

        if(first.valueType === "half.register") return "22";
        else throw new AssemblerError("InvalidOperand", { operand: first.value, instruction: instruction.name }, instruction.line);
    },

    // DEC operand: REG (register)
    DEC: (instruction, operand) => {
        const [first] = operand;

        if(first.valueType === "register") return "23";
        else throw new AssemblerError("InvalidOperand", { operand: first.value, instruction: instruction.name }, instruction.line);
    },

    // DECB operand: REG (half.register)
    DECB: (instruction, operand) => {
        const [first] = operand;

        if(first.valueType === "half.register") return "24";
        else throw new AssemblerError("InvalidOperand", { operand: first.value, instruction: instruction.name }, instruction.line);
    }
};

// number.hex => number.*
function generalizeType(valueType) {
    if(!valueType.startsWith("number") && !valueType.startsWith("memory.number")) return valueType; // Currently only used for number type.
    
    const parts = valueType.split(".");

    if(parts[0] === "memory") return `memory.${parts[1]}.*`;
    return `${parts[0]}.*`;
}
