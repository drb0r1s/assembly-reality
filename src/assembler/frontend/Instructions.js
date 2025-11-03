import { Encoder } from "./Encoder";
import { LengthOf } from "./LengthOf";

/*
    Type examples:

    REG (Register) -> register || half.register: A,
    IND (Indirect addressing) -> memory.register: [A],
    DIR (Direct addressing) -> memory.number.*: [0x1000],
    IMD (Immediate value) -> number.*: 10
*/

export const Instructions = {
    HLT: (instruction, options) => options?.getLength ? LengthOf.noOperands(instruction) : "00",

    MOV: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
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

    MOVB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
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

    ADD: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": "11",
        "register memory.register": "12",
        "register memory.number.*": "13",
        "register number.*": "14"
    }),

    ADDB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": "15",
        "half.register memory.register": "16",
        "half.register memory.half.register": "16",
        "half.register memory.number.*": "17",
        "half.register number.*": "18"
    }),

    SUB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": "19",
        "register memory.register": "1A",
        "register memory.number.*": "1B",
        "register number.*": "1C"
    }),

    SUBB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": "1D",
        "half.register memory.register": "1E",
        "half.register memory.half.register": "1E",
        "half.register memory.number.*": "1F",
        "half.register number.*": "20"
    }),

    INC: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": "21"
    }),

    INCB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "half.register": "22"
    }),

    DEC: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": "23"
    }),

    DECB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "half.register": "24"
    }),

    CMP: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": "25",
        "register memory.register": "26",
        "register memory.number.*": "27",
        "register number.*": "28"
    }),

    CMPB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": "29",
        "half.register memory.register": "2A",
        "half.register memory.half.register": "2A",
        "half.register memory.number.*": "2B",
        "half.register number.*": "2C"
    }),

    JMP: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": "2D",
        "number.*": "2E"
    }),

    JC: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": "2F",
        "number.*": "30"
    }),

    JB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": "2F",
        "number.*": "30"
    }),

    JNAE: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": "2F",
        "number.*": "30"
    }),

    JNC: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": "31",
        "number.*": "32"
    }),

    JAE: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": "31",
        "number.*": "32"
    }),

    JNB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": "31",
        "number.*": "32"
    }),

    JZ: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": "33",
        "number.*": "34"
    }),

    JE: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": "33",
        "number.*": "34"
    }),

    JNZ: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": "35",
        "number.*": "36"
    }),

    JNE: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": "35",
        "number.*": "36"
    }),

    JA: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": "37",
        "number.*": "38"
    }),

    JNBE: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": "37",
        "number.*": "38"
    }),

    JNA: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": "39",
        "number.*": "3A"
    }),

    JBE: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": "39",
        "number.*": "3A"
    }),

    PUSH: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": "3B",
        "number.*": "3C"
    }),

    PUSHB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "half.register": "3F",
        "number.*": "40"
    }),

    POP: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": "43"
    }),

    POPB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "half.register": "44"
    }),

    CALL: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": "45",
        "number.*": "46"
    }),

    RET: (instruction, options) => options?.getLength ? LengthOf.noOperands(instruction) : "47",

    MUL: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": "48",
        "memory.register": "49",
        "memory.number.*": "4A",
        "number.*": "4B"
    }),

    MULB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "half.register": "4C",
        "memory.register": "4D",
        "memory.half.register": "4D",
        "memory.number.*": "4E",
        "number.*": "4F"
    }),

    DIV: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": "50",
        "memory.register": "51",
        "memory.number.*": "52",
        "number.*": "53"
    }),

    DIVB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "half.register": "54",
        "memory.register": "55",
        "memory.half.register": "55",
        "memory.number.*": "56",
        "number.*": "57"
    }),

    AND: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": "58",
        "register memory.register": "59",
        "register memory.number.*": "5A",
        "register number.*": "5B"
    }),

    ANDB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": "5C",
        "half.register memory.register": "5D",
        "half.register memory.half.register": "5D",
        "half.register memory.number.*": "5E",
        "half.register number.*": "5F"
    }),

    OR: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": "60",
        "register memory.register": "61",
        "register memory.number.*": "62",
        "register number.*": "63"
    }),

    ORB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": "64",
        "half.register memory.register": "65",
        "half.register memory.half.register": "65",
        "half.register memory.number.*": "66",
        "half.register number.*": "67"
    }),

    XOR: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": "68",
        "register memory.register": "69",
        "register memory.number.*": "6A",
        "register number.*": "6B"
    }),

    XORB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": "6C",
        "half.register memory.register": "6D",
        "half.register memory.half.register": "6D",
        "half.register memory.number.*": "6E",
        "half.register number.*": "6F"
    }),

    NOT: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": "70"
    }),

    NOTB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "half.register": "71"
    }),

    SHL: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": "72",
        "register memory.register": "73",
        "register memory.number.*": "74",
        "register number.*": "75"
    }),

    SHLB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": "76",
        "half.register memory.register": "77",
        "half.register memory.half.register": "77",
        "half.register memory.number.*": "78",
        "half.register number.*": "79"
    }),

    SHR: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": "7A",
        "register memory.register": "7B",
        "register memory.number.*": "7C",
        "register number.*": "7D"
    }),

    SHRB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": "7E",
        "half.register memory.register": "7F",
        "half.register memory.half.register": "7F",
        "half.register memory.number.*": "80",
        "half.register number.*": "81"
    }),

    CLI: (instruction, options) => options?.getLength ? LengthOf.noOperands(instruction) : "82",

    STI: (instruction, options) => options?.getLength ? LengthOf.noOperands(instruction) : "83",

    IRET: (instruction, options) => options?.getLength ? LengthOf.noOperands(instruction) : "84",

    IN: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": "87",
        "memory.register": "88",
        "memory.number.*": "89",
        "number.*": "8A"
    }),

    OUT: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": "8B",
        "memory.register": "8C",
        "memory.number.*": "8D",
        "number.*": "8E"
    })
};
