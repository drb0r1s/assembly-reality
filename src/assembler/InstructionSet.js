import { Perform } from "./Perform";

/*
    Type examples:

    REG (Register): A,
    IND (Indirect addressing): [A],
    DIR (Direct addressing): [0x1000],
    IMD (Immediate value): 10
*/

export const InstructionSet = {
    HLT: () => "00",
    
    // MOV operands: REG (register) || IND (memory.register) || DIR (memory.number.*) || IMD (number.*)
    MOV: instruction => Perform.twoOperands(instruction, {
        "register register": "01",
        "register memory.register": "02",
        "register memory.half.register": "02",
        "register memory.number.*": "03",
        "memory.register register": "04",
        "memory.number.* register": "05",
        "register number.*": "06",
        "memory.register number.*": "07",
        "memory.number.* number.*": "08"
    }),

    // MOVB operands: REG (half.register) || IND (memory.register. memory.half.register) || DIR (memory.number.*) || IMD (number.*)
    MOVB: instruction => Perform.twoOperands(instruction, {
        "half.register half.register": "09",
        "half.register memory.register": "0A",
        "half.register memory.half.register": "0A",
        "half.register memory.number.*": "0B",
        "memory.register half.register": "0C",
        "memory.half.register half.register": "0C",
        "memory.number.* half.register": "0D",
        "half.register number.*": "0E",
        "memory.register number.*": "0F",
        "memory.half.register number.*": "0F",
        "memory.number.* number.*": "10"
    }),

    // ADD operands: REG (register) || IND (memory.register) || DIR (memory.number.*) || IMD (number.*)
    ADD: instruction => Perform.twoOperands(instruction, {
        "register register": "11",
        "register memory.register": "12",
        "register memory.number.*": "13",
        "register number.*": "14"
    }),

    // ADDB operands: REG (half.register) || IND (memory.register, memory.half.register) || DIR (memory.number.*) || IMD (number.*)
    ADDB: instruction => Perform.twoOperands(instruction, {
        "half.register half.register": "15",
        "half.register memory.register": "16",
        "half.register memory.half.register": "16",
        "half.register memory.number.*": "17",
        "half.register number.*": "18"
    }),

    // SUB operands: REG (register) || IND (memory.register) || DIR (memory.number.*) || IMD (number.*)
    SUB: instruction => Perform.twoOperands(instruction, {
        "register register": "19",
        "register memory.register": "1A",
        "register memory.number.*": "1B",
        "register number.*": "1C"
    }),

    // SUBB operands: REG (half.register) || IND (memory.register, memory.half.register) || DIR (memory.number.*) || IMD (number.*)
    SUBB: instruction => Perform.twoOperands(instruction, {
        "half.register half.register": "1D",
        "half.register memory.register": "1E",
        "half.register memory.half.register": "1E",
        "half.register memory.number.*": "1F",
        "half.register number.*": "20"
    }),

    // INC operand: REG (register)
    INC: instruction => Perform.oneOperand(instruction, {
        "register": "21"
    }),

    // INCB operand: REG (half.register)
    INCB: instruction => Perform.oneOperand(instruction, {
        "half.register": "22"
    }),

    // DEC operand: REG (register)
    DEC: instruction => Perform.oneOperand(instruction, {
        "register": "23"
    }),

    // DECB operand: REG (half.register)
    DECB: instruction => Perform.oneOperand(instruction, {
        "half.register": "24"
    }),

    // CMP operands: REG (register) || IND (memory.register) || DIR (memory.number.*) || IMD (number.*)
    CMP: instruction => Perform.twoOperands(instruction, {
        "register register": "25",
        "register memory.register": "26",
        "register memory.number.*": "27",
        "register number.*": "28"
    }),

    // CMPB operands: REG (half.register) || IND (memory.register, memory.half.register) || DIR (memory.number.*) || IMD (number.*)
    CMPB: instruction => Perform.twoOperands(instruction, {
        "half.register half.register": "29",
        "half.register memory.register": "2A",
        "half.register memory.half.register": "2A",
        "half.register memory.number.*": "2B",
        "half.register number.*": "2C"
    }),

    // JMP operand: IND (memoy.register) || IMD (number.*)
    JMP: instruction => Perform.oneOperand(instruction, {
        "memory.register": "2D",
        "number.*": "2E"
    }),

    // JC operand: IND (memoy.register) || IMD (number.*)
    JC: instruction => Perform.oneOperand(instruction, {
        "memory.register": "2F",
        "number.*": "30"
    }),

    // JNC operand: IND (memoy.register) || IMD (number.*)
    JNC: instruction => Perform.oneOperand(instruction, {
        "memory.register": "31",
        "number.*": "32"
    }),

    // JZ operand: IND (memoy.register) || IMD (number.*)
    JZ: instruction => Perform.oneOperand(instruction, {
        "memory.register": "33",
        "number.*": "34"
    }),

    // JNZ operand: IND (memoy.register) || IMD (number.*)
    JNZ: instruction => Perform.oneOperand(instruction, {
        "memory.register": "35",
        "number.*": "36"
    }),

    // JA operand: IND (memoy.register) || IMD (number.*)
    JA: instruction => Perform.oneOperand(instruction, {
        "memory.register": "37",
        "number.*": "38"
    }),

    // JNA operand: IND (memoy.register) || IMD (number.*)
    JNA: instruction => Perform.oneOperand(instruction, {
        "memory.register": "39",
        "number.*": "3A"
    }),

    // PUSH operand: REG (register) || IMD (number.*)
    PUSH: instruction => Perform.oneOperand(instruction, {
        "register": "3B",
        "number.*": "3C"
    }),

    // PUSHB operand: REG (half.register) || IMD (number.*)
    PUSHB: instruction => Perform.oneOperand(instruction, {
        "half.register": "3F",
        "number.*": "40"
    }),

    // POP operand: REG (register)
    POP: instruction => Perform.oneOperand(instruction, {
        "register": "43"
    }),

    // POPB operand: REG (half.register)
    POPB: instruction => Perform.oneOperand(instruction, {
        "half.register": "44"
    }),

    // CALL operand: IND (memory.register) || IMD (number.*)
    CALL: instruction => Perform.oneOperand(instruction, {
        "memory.register": "45",
        "number.*": "46"
    }),

    RET: () => "47",

    // MUL operand: REG (register) || IND (memory.register) || DIR (memory.number.*) || IMD (number.*)
    MUL: instruction => Perform.oneOperand(instruction, {
        "register": "48",
        "memory.register": "49",
        "memory.number.*": "4A",
        "number.*": "4B"
    }),

    // MULB operand: REG (half.register) || IND (memory.register, memory.half.register) || DIR (memory.number.*) || IMD (number.*)
    MULB: instruction => Perform.oneOperand(instruction, {
        "half.register": "4C",
        "memory.register": "4D",
        "memory.half.register": "4D",
        "memory.number.*": "4E",
        "number.*": "4F"
    }),

    // DIV operand: REG (register) || IND (memory.register) || DIR (memory.number.*) || IMD (number.*)
    DIV: instruction => Perform.oneOperand(instruction, {
        "register": "50",
        "memory.register": "51",
        "memory.number.*": "52",
        "number.*": "53"
    }),

    // DIVB operand: REG (half.register) || IND (memory.register, memory.half.register) || DIR (memory.number.*) || IMD (number.*)
    DIVB: instruction => Perform.oneOperand(instruction, {
        "half.register": "54",
        "memory.register": "55",
        "memory.half.register": "55",
        "memory.number.*": "56",
        "number.*": "57"
    }),

    // AND operands: REG (register) || IND (memory.register) || DIR (memory.number.*) || IMD (number.*)
    AND: instruction => Perform.twoOperands(instruction, {
        "register register": "58",
        "register memory.register": "59",
        "register memory.number.*": "5A",
        "register number.*": "5B"
    }),

    // ANDB operands: REG (half.register) || IND (memory.register, memory.half.register) || DIR (memory.number.*) || IMD (number.*)
    ANDB: instruction => Perform.twoOperands(instruction, {
        "half.register half.register": "5C",
        "half.register memory.register": "5D",
        "half.register memory.half.register": "5D",
        "half.register memory.number.*": "5E",
        "half.register number.*": "5F"
    }),

    // OR operands: REG (register) || IND (memory.register) || DIR (memory.number.*) || IMD (number.*)
    OR: instruction => Perform.twoOperands(instruction, {
        "register register": "60",
        "register memory.register": "61",
        "register memory.number.*": "62",
        "register number.*": "63"
    }),

    // ORB operands: REG (half.register) || IND (memory.register, memory.half.register) || DIR (memory.number.*) || IMD (number.*)
    ORB: instruction => Perform.twoOperands(instruction, {
        "half.register half.register": "64",
        "half.register memory.register": "65",
        "half.register memory.half.register": "65",
        "half.register memory.number.*": "66",
        "half.register number.*": "67"
    }),

    // XOR operands: REG (register) || IND (memory.register) || DIR (memory.number.*) || IMD (number.*)
    XOR: instruction => Perform.twoOperands(instruction, {
        "register register": "68",
        "register memory.register": "69",
        "register memory.number.*": "6A",
        "register number.*": "6B"
    }),

    // XORB operands: REG (half.register) || IND (memory.register, memory.half.register) || DIR (memory.number.*) || IMD (number.*)
    XORB: instruction => Perform.twoOperands(instruction, {
        "half.register half.register": "6C",
        "half.register memory.register": "6D",
        "half.register memory.half.register": "6D",
        "half.register memory.number.*": "6E",
        "half.register number.*": "6F"
    }),

    // NOT operand: REG (register)
    NOT: instruction => Perform.oneOperand(instruction, {
        "register": "70"
    }),

    // NOTB operand: REG (half.register)
    NOTB: instruction => Perform.oneOperand(instruction, {
        "half.register": "71"
    }),

    // SHL operands: REG (register) || IND (memory.register) || DIR (memory.number.*) || IMD (number.*)
    SHL: instruction => Perform.twoOperands(instruction, {
        "register register": "72",
        "register memory.register": "73",
        "register memory.number.*": "74",
        "register number.*": "75"
    }),

    // SHLB operands: REG (half.register) || IND (memory.register, memory.half.register) || DIR (memory.number.*) || IMD (number.*)
    SHLB: instruction => Perform.twoOperands(instruction, {
        "half.register half.register": "76",
        "half.register memory.register": "77",
        "half.register memory.half.register": "77",
        "half.register memory.number.*": "78",
        "half.register number.*": "79"
    }),

    // SHR operands: REG (register) || IND (memory.register) || DIR (memory.number.*) || IMD (number.*)
    SHR: instruction => Perform.twoOperands(instruction, {
        "register register": "7A",
        "register memory.register": "7B",
        "register memory.number.*": "7C",
        "register number.*": "7D"
    }),

    // SHRB operands: REG (half.register) || IND (memory.register, memory.half.register) || DIR (memory.number.*) || IMD (number.*)
    SHRB: instruction => Perform.twoOperands(instruction, {
        "half.register half.register": "7E",
        "half.register memory.register": "7F",
        "half.register memory.half.register": "7F",
        "half.register memory.number.*": "80",
        "half.register number.*": "81"
    }),

    CLI: () => "82",

    STI: () => "83",

    IRET: () => "84",

    // IN operands: REG (register) || IND (memory.register) || DIR (memory.number.*) || IMD (number.*)
    IN: instruction => Perform.oneOperand(instruction, {
        "register": "87",
        "memory.register": "88",
        "memory.number.*": "89",
        "number.*": "8A"
    }),

    // OUT operands: REG (register) || IND (memory.register) || DIR (memory.number.*) || IMD (number.*)
    OUT: instruction => Perform.oneOperand(instruction, {
        "register": "8B",
        "memory.register": "8C",
        "memory.number.*": "8D",
        "number.*": "8E"
    })
};