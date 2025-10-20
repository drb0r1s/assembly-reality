/*
    Type examples:

    REG (Register): A,
    IND (Indirect addressing): [A],
    DIR (Direct addressing): [0x1000],
    IMD (Immediate value): 10
*/

export const InstructionSet = {
    // MOV operands: REG (register) || IND (memory.register) || DIR (memory.number.hex) || IMD (number.*)
    MOV: operands => {
        const [first, second] = operands;

        const valueTypes = `${generalizeType(first.valueType)} ${generalizeType(second.valueType)}`;

        switch(valueTypes) {
            case "register register": return "01";
            case "register memory.register": return "02";
            case "register memory.number.hex": return "03";
            case "memory.register register": return "04";
            case "memory.number.hex register": return "05";
            case "register number.*": return "06";
            case "memory.register number.*": return "07";
            case "memory.number.hex number.*": return "08";
        }
    }
};

// number.hex => number.*
function generalizeType(valueType) {
    if(!valueType.startsWith("number")) return valueType; // Currently only used for number type.
    
    const parts = valueType.split(".");
    return `${parts[0]}.*`;
}