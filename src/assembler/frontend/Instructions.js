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
    HLT: (instruction, options) => options?.getLength ? LengthOf.noOperands(instruction) : [0x00],

    MOV: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": 0x01,
        "register memory.register": 0x02,
        "register memory.number.*": 0x03,
        "memory.register register": 0x04,
        "memory.number.* register": 0x05,
        "register number.*": 0x06,
        "memory.register number.*": 0x07,
        "memory.number.* number.*": 0x08
    }),

    MOVB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": 0x09,
        "half.register memory.register": 0x0A,
        "half.register memory.number.*": 0x0B,
        "memory.register half.register": 0x0C,
        "memory.number.* half.register": 0x0D,
        "half.register number.*": 0x0E,
        "memory.register number.*": 0x0F,
        "memory.number.* number.*": 0x10
    }),

    ADD: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": 0x11,
        "register memory.register": 0x12,
        "register memory.number.*": 0x13,
        "register number.*": 0x14
    }),

    ADDB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": 0x15,
        "half.register memory.register": 0x16,
        "half.register memory.number.*": 0x17,
        "half.register number.*": 0x18
    }),

    SUB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": 0x19,
        "register memory.register": 0x1A,
        "register memory.number.*": 0x1B,
        "register number.*": 0x1C
    }),

    SUBB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": 0x1D,
        "half.register memory.register": 0x1E,
        "half.register memory.number.*": 0x1F,
        "half.register number.*": 0x20
    }),

    INC: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": 0x21
    }),

    INCB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "half.register": 0x22
    }),

    DEC: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": 0x23
    }),

    DECB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "half.register": 0x24
    }),

    CMP: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": 0x25,
        "register memory.register": 0x26,
        "register memory.number.*": 0x27,
        "register number.*": 0x28
    }),

    CMPB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": 0x29,
        "half.register memory.register": 0x2A,
        "half.register memory.number.*": 0x2B,
        "half.register number.*": 0x2C
    }),

    JMP: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": 0x2D,
        "number.*": 0x2E
    }),

    JC: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": 0x2F,
        "number.*": 0x30
    }),

    JB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": 0x2F,
        "number.*": 0x30
    }),

    JNAE: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": 0x2F,
        "number.*": 0x30
    }),

    JNC: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": 0x31,
        "number.*": 0x32
    }),

    JAE: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": 0x31,
        "number.*": 0x32
    }),

    JNB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": 0x31,
        "number.*": 0x32
    }),

    JZ: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": 0x33,
        "number.*": 0x34
    }),

    JE: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": 0x33,
        "number.*": 0x34
    }),

    JNZ: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": 0x35,
        "number.*": 0x36
    }),

    JNE: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": 0x35,
        "number.*": 0x36
    }),

    JA: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": 0x37,
        "number.*": 0x38
    }),

    JNBE: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": 0x37,
        "number.*": 0x38
    }),

    JNA: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": 0x39,
        "number.*": 0x3A
    }),

    JBE: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": 0x39,
        "number.*": 0x3A
    }),

    PUSH: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": 0x3B,
        "number.*": 0x3C
    }),

    PUSHB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "half.register": 0x3F,
        "number.*": 0x40
    }),

    POP: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": 0x43
    }),

    POPB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "half.register": 0x44
    }),

    CALL: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "memory.register": 0x45,
        "number.*": 0x46
    }),

    RET: (instruction, options) => options?.getLength ? LengthOf.noOperands(instruction) : [0x47],

    MUL: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": 0x48,
        "memory.register": 0x49,
        "memory.number.*": 0x4A,
        "number.*": 0x4B
    }),

    MULB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "half.register": 0x4C,
        "memory.register": 0x4D,
        "memory.number.*": 0x4E,
        "number.*": 0x4F
    }),

    DIV: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": 0x50,
        "memory.register": 0x51,
        "memory.number.*": 0x52,
        "number.*": 0x53
    }),

    DIVB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "half.register": 0x54,
        "memory.register": 0x55,
        "memory.number.*": 0x56,
        "number.*": 0x57
    }),

    AND: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": 0x58,
        "register memory.register": 0x59,
        "register memory.number.*": 0x5A,
        "register number.*": 0x5B
    }),

    ANDB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": 0x5C,
        "half.register memory.register": 0x5D,
        "half.register memory.number.*": 0x5E,
        "half.register number.*": 0x5F
    }),

    OR: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": 0x60,
        "register memory.register": 0x61,
        "register memory.number.*": 0x62,
        "register number.*": 0x63
    }),

    ORB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": 0x64,
        "half.register memory.register": 0x65,
        "half.register memory.number.*": 0x66,
        "half.register number.*": 0x67
    }),

    XOR: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": 0x68,
        "register memory.register": 0x69,
        "register memory.number.*": 0x6A,
        "register number.*": 0x6B
    }),

    XORB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": 0x6C,
        "half.register memory.register": 0x6D,
        "half.register memory.number.*": 0x6E,
        "half.register number.*": 0x6F
    }),

    NOT: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": 0x70
    }),

    NOTB: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "half.register": 0x71
    }),

    SHL: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": 0x72,
        "register memory.register": 0x73,
        "register memory.number.*": 0x74,
        "register number.*": 0x75
    }),

    SHLB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": 0x76,
        "half.register memory.register": 0x77,
        "half.register memory.number.*": 0x78,
        "half.register number.*": 0x79
    }),

    SHR: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "register register": 0x7A,
        "register memory.register": 0x7B,
        "register memory.number.*": 0x7C,
        "register number.*": 0x7D
    }),

    SHRB: (instruction, options) => options?.getLength ? LengthOf.twoOperands(instruction) : Encoder.twoOperands(instruction, {
        "half.register half.register": 0x7E,
        "half.register memory.register": 0x7F,
        "half.register memory.number.*": 0x80,
        "half.register number.*": 0x81
    }),

    CLI: (instruction, options) => options?.getLength ? LengthOf.noOperands(instruction) : [0x82],

    STI: (instruction, options) => options?.getLength ? LengthOf.noOperands(instruction) : [0x83],

    IRET: (instruction, options) => options?.getLength ? LengthOf.noOperands(instruction) : [0x84],

    IN: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": 0x87,
        "memory.register": 0x88,
        "memory.number.*": 0x89,
        "number.*": 0x8A
    }),

    OUT: (instruction, options) => options?.getLength ? LengthOf.oneOperand(instruction) : Encoder.oneOperand(instruction, {
        "register": 0x8B,
        "memory.register": 0x8C,
        "memory.number.*": 0x8D,
        "number.*": 0x8E
    })
};