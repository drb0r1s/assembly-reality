import { Executable } from "./Executable";

export const Executor = {
    codes: {
        // HLT
        0x00: { instruction: "HLT", type: "", length: 1 },

        // MOV
        0x01: { instruction: "MOV", type: "register register", length: 3 },
        0x02: { instruction: "MOV", type: "register memory.register", length: 4 },
        0x03: { instruction: "MOV", type: "register memory.number.*", length: 4 },
        0x04: { instruction: "MOV", type: "memory.register register", length: 4 },
        0x05: { instruction: "MOV", type: "memory.number.* register", length: 4 },
        0x06: { instruction: "MOV", type: "register number.*", length: 4 },
        0x07: { instruction: "MOV", type: "memory.register number.*", length: 5 },
        0x08: { instruction: "MOV", type: "memory.number.* number.*", length: 5 },

        // MOVB
        0x09: { instruction: "MOVB", type: "half.register half.register", length: 3 },
        0x0A: { instruction: "MOVB", type: "half.register memory.register", length: 4 },
        0x0B: { instruction: "MOVB", type: "half.register memory.number.*", length: 4 },
        0x0C: { instruction: "MOVB", type: "memory.register half.register", length: 4 },
        0x0D: { instruction: "MOVB", type: "memory.number.* half.register", length: 4 },
        0x0E: { instruction: "MOVB", type: "half.register number.*", length: 3 },
        0x0F: { instruction: "MOVB", type: "memory.register number.*", length: 4 },
        0x10: { instruction: "MOVB", type: "memory.number.* number.*", length: 4 },
        
        // ADD
        0x11: { instruction: "ADD", type: "register register", length: 3 },
        0x12: { instruction: "ADD", type: "register memory.register", length: 4 },
        0x13: { instruction: "ADD", type: "register memory.number.*", length: 4 },
        0x14: { instruction: "ADD", type: "register number.*", length: 4 },

        // ADDB
        0x15: { instruction: "ADDB", type: "half.register half.register", length: 3 },
        0x16: { instruction: "ADDB", type: "half.register memory.register", length: 4 },
        0x17: { instruction: "ADDB", type: "half.register memory.number.*", length: 4 },
        0x18: { instruction: "ADDB", type: "half.register number.*", length: 3 },

        // SUB
        0x19: { instruction: "SUB", type: "register register", length: 3 },
        0x1A: { instruction: "SUB", type: "register memory.register", length: 4 },
        0x1B: { instruction: "SUB", type: "register memory.number.*", length: 4 },
        0x1C: { instruction: "SUB", type: "register number.*", length: 4 },

        // SUBB
        0x1D: { instruction: "SUBB", type: "half.register half.register", length: 3 },
        0x1E: { instruction: "SUBB", type: "half.register memory.register", length: 4 },
        0x1F: { instruction: "SUBB", type: "half.register memory.number.*", length: 4 },
        0x20: { instruction: "SUBB", type: "half.register number.*", length: 3 },

        // INC
        0x21: { instruction: "INC", type: "register", length: 2 },

        // INCB
        0x22: { instruction: "INCB", type: "half.register", length: 2 },

        // DEC
        0x23: { instruction: "DEC", type: "register", length: 2 },

        // DECB
        0x24: { instruction: "DECB", type: "half.register", length: 2 },

        // CMP
        0x25: { instruction: "CMP", type: "register register", length: 3 },
        0x26: { instruction: "CMP", type: "register memory.register", length: 4 },
        0x27: { instruction: "CMP", type: "register memory.number.*", length: 4 },
        0x28: { instruction: "CMP", type: "register number.*", length: 4 },

        // CMPB
        0x29: { instruction: "CMPB", type: "half.register half.register", length: 3 },
        0x2A: { instruction: "CMPB", type: "half.register memory.register", length: 4 },
        0x2B: { instruction: "CMPB", type: "half.register memory.number.*", length: 4 },
        0x2C: { instruction: "CMPB", type: "half.register number.*", length: 3 },

        // JMP
        0x2D: { instruction: "JMP", type: "memory.register", length: 3 },
        0x2E: { instruction: "JMP", type: "number.*", length: 3 },

        // JC
        0x2F: { instruction: "JC", type: "memory.register", length: 3 },
        0x30: { instruction: "JC", type: "number.*", length: 3 },

        // JNC
        0x31: { instruction: "JNC", type: "memory.register", length: 3 },
        0x32: { instruction: "JNC", type: "number.*", length: 3 },

        // JZ
        0x33: { instruction: "JZ", type: "memory.register", length: 3 },
        0x34: { instruction: "JZ", type: "number.*", length: 3 },

        // JNZ
        0x35: { instruction: "JNZ", type: "memory.register", length: 3 },
        0x36: { instruction: "JNZ", type: "number.*", length: 3 },

        // JA
        0x37: { instruction: "JA", type: "memory.register", length: 3 },
        0x38: { instruction: "JA", type: "number.*", length: 3 },

        // JNA
        0x39: { instruction: "JNA", type: "memory.register", length: 3 },
        0x3A: { instruction: "JNA", type: "number.*", length: 3 },

        // PUSH
        0x3B: { instruction: "PUSH", type: "register", length: 2 },
        0x3C: { instruction: "PUSH", type: "number.*", length: 3 },

        // PUSHB
        0x3F: { instruction: "PUSHB", type: "half.register", length: 2 },
        0x40: { instruction: "PUSHB", type: "number.*", length: 2 },

        // POP
        0x43: { instruction: "POP", type: "register", length: 2 },

        // POPB
        0x44: { instruction: "POPB", type: "half.register", length: 2 },

        // CALL
        0x45: { instruction: "CALL", type: "memory.register", length: 3 },
        0x46: { instruction: "CALL", type: "number.*", length: 3 },

        // RET
        0x47: { instruction: "RET", type: "", length: 1 },
        
        // MUL
        0x48: { instruction: "MUL", type: "register", length: 2 },
        0x49: { instruction: "MUL", type: "memory.register", length: 3 },
        0x4A: { instruction: "MUL", type: "memory.number.*", length: 3 },
        0x4B: { instruction: "MUL", type: "number.*", length: 3 },

        // MULB
        0x4C: { instruction: "MULB", type: "half.register", length: 2 },
        0x4D: { instruction: "MULB", type: "memory.register", length: 3 },
        0x4E: { instruction: "MULB", type: "memory.number.*", length: 3 },
        0x4F: { instruction: "MULB", type: "number.*", length: 2 },

        // DIV
        0x50: { instruction: "DIV", type: "register", length: 2 },
        0x51: { instruction: "DIV", type: "memory.register", length: 3 },
        0x52: { instruction: "DIV", type: "memory.number.*", length: 3 },
        0x53: { instruction: "DIV", type: "number.*", length: 3 },

        // DIVB
        0x54: { instruction: "DIVB", type: "half.register", length: 2 },
        0x55: { instruction: "DIVB", type: "memory.register", length: 3 },
        0x56: { instruction: "DIVB", type: "memory.number.*", length: 3 },
        0x57: { instruction: "DIVB", type: "number.*", length: 2 },

        // AND
        0x58: { instruction: "AND", type: "register register", length: 3 },
        0x59: { instruction: "AND", type: "register memory.register", length: 4 },
        0x5A: { instruction: "AND", type: "register memory.number.*", length: 4 },
        0x5B: { instruction: "AND", type: "register number.*", length: 4 },

        // ANDB
        0x5C: { instruction: "ANDB", type: "half.register half.register", length: 3 },
        0x5D: { instruction: "ANDB", type: "half.register memory.register", length: 4 },
        0x5E: { instruction: "ANDB", type: "half.register memory.number.*", length: 4 },
        0x5F: { instruction: "ANDB", type: "half.register number.*", length: 3 },

        // OR
        0x60: { instruction: "OR", type: "register register", length: 3 },
        0x61: { instruction: "OR", type: "register memory.register", length: 4 },
        0x62: { instruction: "OR", type: "register memory.number.*", length: 4 },
        0x63: { instruction: "OR", type: "register number.*", length: 4 },

        // ORB
        0x64: { instruction: "ORB", type: "half.register half.register", length: 3 },
        0x65: { instruction: "ORB", type: "half.register memory.register", length: 4 },
        0x66: { instruction: "ORB", type: "half.register memory.number.*", length: 4 },
        0x67: { instruction: "ORB", type: "half.register number.*", length: 3 },

        // XOR
        0x68: { instruction: "XOR", type: "register register", length: 3 },
        0x69: { instruction: "XOR", type: "register memory.register", length: 4 },
        0x6A: { instruction: "XOR", type: "register memory.number.*", length: 4 },
        0x6B: { instruction: "XOR", type: "register number.*", length: 4 },

        // XORB
        0x6C: { instruction: "XORB", type: "half.register half.register", length: 3 },
        0x6D: { instruction: "XORB", type: "half.register memory.register", length: 4 },
        0x6E: { instruction: "XORB", type: "half.register memory.number.*", length: 4 },
        0x6F: { instruction: "XORB", type: "half.register number.*", length: 3 },

        // NOT
        0x70: { instruction: "NOT", type: "register", length: 2 },

        // NOTB
        0x71: { instruction: "NOTB", type: "half.register", length: 2 },

        // SHL
        0x72: { instruction: "SHL", type: "register register", length: 3 },
        0x73: { instruction: "SHL", type: "register memory.register", length: 4 },
        0x74: { instruction: "SHL", type: "register memory.number.*", length: 4 },
        0x75: { instruction: "SHL", type: "register number.*", length: 4 },

        // SHLB
        0x76: { instruction: "SHLB", type: "half.register half.register", length: 3 },
        0x77: { instruction: "SHLB", type: "half.register memory.register", length: 4 },
        0x78: { instruction: "SHLB", type: "half.register memory.number.*", length: 4 },
        0x79: { instruction: "SHLB", type: "half.register number.*", length: 3 },

        // SHR
        0x7A: { instruction: "SHR", type: "register register", length: 3 },
        0x7B: { instruction: "SHR", type: "register memory.register", length: 4 },
        0x7C: { instruction: "SHR", type: "register memory.number.*", length: 4 },
        0x7D: { instruction: "SHR", type: "register number.*", length: 4 },

        // SHRB
        0x7E: { instruction: "SHRB", type: "half.register half.register", length: 3 },
        0x7F: { instruction: "SHRB", type: "half.register memory.register", length: 4 },
        0x80: { instruction: "SHRB", type: "half.register memory.number.*", length: 4 },
        0x81: { instruction: "SHRB", type: "half.register number.*", length: 3 },

        // IN
        0x87: { instruction: "IN", type: "register", length: 2 },
        0x88: { instruction: "IN", type: "memory.register", length: 3 },
        0x89: { instruction: "IN", type: "memory.number.*", length: 3 },
        0x8A: { instruction: "IN", type: "number.*", length: 3 },

        // OUT
        0x8B: { instruction: "OUT", type: "register", length: 2 },
        0x8C: { instruction: "OUT", type: "memory.register", length: 3 },
        0x8D: { instruction: "OUT", type: "memory.number.*", length: 3 },
        0x8E: { instruction: "OUT", type: "number.*", length: 3 },
    },

    HLT: (...params) => Executable.halt(...params),

    MOV: (...params) => Executable.move(...params),
    MOVB: (...params) => Executable.move(...params),

    ADD: (...params) => Executable.bitwise(...params),
    ADDB: (...params) => Executable.bitwise(...params),

    SUB: (...params) => Executable.bitwise(...params),
    SUBB: (...params) => Executable.bitwise(...params),

    INC: (...params) => Executable.bitwise(...params),
    INCB: (...params) => Executable.bitwise(...params),

    DEC: (...params) => Executable.bitwise(...params),
    DECB: (...params) => Executable.bitwise(...params),

    CMP: (...params) => Executable.compare(...params),
    CMPB: (...params) => Executable.compare(...params),

    JMP: (...params) => Executable.jump(...params),

    JC: (...params) => Executable.jump(...params),
    JNC: (...params) => Executable.jump(...params),

    JZ: (...params) => Executable.jump(...params),
    JNZ: (...params) => Executable.jump(...params),

    JA: (...params) => Executable.jump(...params),
    JNA: (...params) => Executable.jump(...params),

    PUSH: (...params) => Executable.push(...params),
    PUSHB: (...params) => Executable.push(...params),

    POP: (...params) => Executable.pop(...params),
    POPB: (...params) => Executable.pop(...params),

    CALL: (...params) => Executable.call(...params),

    RET: (...params) => Executable.ret(...params),

    MUL: (...params) => Executable.bitwise(...params),
    MULB: (...params) => Executable.bitwise(...params),

    DIV: (...params) => Executable.bitwise(...params),
    DIVB: (...params) => Executable.bitwise(...params),

    AND: (...params) => Executable.bitwise(...params),
    ANDB: (...params) => Executable.bitwise(...params),

    OR: (...params) => Executable.bitwise(...params),
    ORB: (...params) => Executable.bitwise(...params),

    XOR: (...params) => Executable.bitwise(...params),
    XORB: (...params) => Executable.bitwise(...params),

    NOT: (...params) => Executable.bitwise(...params),
    NOTB: (...params) => Executable.bitwise(...params),

    SHL: (...params) => Executable.bitwise(...params),
    SHLB: (...params) => Executable.bitwise(...params),

    SHR: (...params) => Executable.bitwise(...params),
    SHRB: (...params) => Executable.bitwise(...params),

    IN: (...params) => Executable.in(...params),

    OUT: (...params) => Executable.out(...params),
};