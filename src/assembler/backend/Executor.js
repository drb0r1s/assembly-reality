import { Executable } from "./Executable";

export const Executor = {
    codes: {
        // MOV
        "01": { instruction: "MOV", type: "register register", length: 3 },
        "02": { instruction: "MOV", type: "register memory.register", length: 4 },
        "03": { instruction: "MOV", type: "register memory.number.*", length: 4 },
        "04": { instruction: "MOV", type: "memory.register register", length: 4 },
        "05": { instruction: "MOV", type: "memory.number.* register", length: 4 },
        "06": { instruction: "MOV", type: "register number.*", length: 4 },
        "07": { instruction: "MOV", type: "memory.register number.*", length: 5 },
        "08": { instruction: "MOV", type: "memory.number.* number.*", length: 5 },

        // MOVB
        "09": { instruction: "MOVB", type: "half.register half.register", length: 3 },
        "0A": { instruction: "MOVB", type: "half.register memory.register", length: 4 },
        "0B": { instruction: "MOVB", type: "half.register memory.number.*", length: 4 },
        "0C": { instruction: "MOVB", type: "memory.register half.register", length: 4 },
        "0D": { instruction: "MOVB", type: "memory.number.* half.register", length: 4 },
        "0E": { instruction: "MOVB", type: "half.register number.*", length: 3 },
        "0F": { instruction: "MOVB", type: "memory.register number.*", length: 4 },
        "10": { instruction: "MOVB", type: "memory.number.* number.*", length: 4 },
        
        // ADD
        "11": { instruction: "ADD", type: "register register", length: 3 },
        "12": { instruction: "ADD", type: "register memory.register", length: 4 },
        "13": { instruction: "ADD", type: "register memory.number.*", length: 4 },
        "14": { instruction: "ADD", type: "register number.*", length: 4 },

        // ADDB
        "15": { instruction: "ADDB", type: "half.register half.register", length: 3 },
        "16": { instruction: "ADDB", type: "half.register memory.register", length: 4 },
        "17": { instruction: "ADDB", type: "half.register memory.number.*", length: 4 },
        "18": { instruction: "ADDB", type: "half.register number.*", length: 3 },

        // SUB
        "19": { instruction: "SUB", type: "register register", length: 3 },
        "1A": { instruction: "SUB", type: "register memory.register", length: 4 },
        "1B": { instruction: "SUB", type: "register memory.number.*", length: 4 },
        "1C": { instruction: "SUB", type: "register number.*", length: 4 },

        // SUBB
        "1D": { instruction: "SUBB", type: "half.register half.register", length: 3 },
        "1E": { instruction: "SUBB", type: "half.register memory.register", length: 4 },
        "1F": { instruction: "SUBB", type: "half.register memory.number.*", length: 4 },
        "20": { instruction: "SUBB", type: "half.register number.*", length: 3 },

        // INC
        "21": { instruction: "INC", type: "register", length: 2 },

        // INCB
        "22": { instruction: "INCB", type: "half.register", length: 2 },

        // DEC
        "23": { instruction: "DEC", type: "register", length: 2 },

        // DECB
        "24": { instruction: "DECB", type: "half.register", length: 2 },

        // MUL
        "48": { instruction: "MUL", type: "register", length: 2 },
        "49": { instruction: "MUL", type: "memory.register", length: 3 },
        "4A": { instruction: "MUL", type: "memory.number.*", length: 3 },
        "4B": { instruction: "MUL", type: "number.*", length: 3 },

        // MULB
        "4C": { instruction: "MULB", type: "half.register", length: 2 },
        "4D": { instruction: "MULB", type: "memory.register", length: 3 },
        "4E": { instruction: "MULB", type: "memory.number.*", length: 3 },
        "4F": { instruction: "MULB", type: "number.*", length: 2 },

        // DIV
        "50": { instruction: "DIV", type: "register", length: 2 },
        "51": { instruction: "DIV", type: "memory.register", length: 3 },
        "52": { instruction: "DIV", type: "memory.number.*", length: 3 },
        "53": { instruction: "DIV", type: "number.*", length: 3 },

        // DIVB
        "54": { instruction: "DIVB", type: "half.register", length: 2 },
        "55": { instruction: "DIVB", type: "memory.register", length: 3 },
        "56": { instruction: "DIVB", type: "memory.number.*", length: 3 },
        "57": { instruction: "DIVB", type: "number.*", length: 2 },

        // AND
        "58": { instruction: "AND", type: "register register", length: 3 },
        "59": { instruction: "AND", type: "register memory.register", length: 4 },
        "5A": { instruction: "AND", type: "register memory.number.*", length: 4 },
        "5B": { instruction: "AND", type: "register number.*", length: 4 },

        // ANDB
        "5C": { instruction: "ANDB", type: "half.register half.register", length: 3 },
        "5D": { instruction: "ANDB", type: "half.register memory.register", length: 4 },
        "5E": { instruction: "ANDB", type: "half.register memory.number.*", length: 4 },
        "5F": { instruction: "ANDB", type: "half.register number.*", length: 3 },

        // OR
        "60": { instruction: "OR", type: "register register", length: 3 },
        "61": { instruction: "OR", type: "register memory.register", length: 4 },
        "62": { instruction: "OR", type: "register memory.number.*", length: 4 },
        "63": { instruction: "OR", type: "register number.*", length: 4 },

        // ORB
        "64": { instruction: "ORB", type: "half.register half.register", length: 3 },
        "65": { instruction: "ORB", type: "half.register memory.register", length: 4 },
        "66": { instruction: "ORB", type: "half.register memory.number.*", length: 4 },
        "67": { instruction: "ORB", type: "half.register number.*", length: 3 },

        // XOR
        "68": { instruction: "XOR", type: "register register", length: 3 },
        "69": { instruction: "XOR", type: "register memory.register", length: 4 },
        "6A": { instruction: "XOR", type: "register memory.number.*", length: 4 },
        "6B": { instruction: "XOR", type: "register number.*", length: 4 },

        // XORB
        "6C": { instruction: "XORB", type: "half.register half.register", length: 3 },
        "6D": { instruction: "XORB", type: "half.register memory.register", length: 4 },
        "6E": { instruction: "XORB", type: "half.register memory.number.*", length: 4 },
        "6F": { instruction: "XORB", type: "half.register number.*", length: 3 },

        // NOT
        "70": { instruction: "NOT", type: "register", length: 2 },

        // NOTB
        "71": { instruction: "NOTB", type: "half.register", length: 2 },

        // SHL
        "72": { instruction: "SHL", type: "register register", length: 3 },
        "73": { instruction: "SHL", type: "register memory.register", length: 4 },
        "74": { instruction: "SHL", type: "register memory.number.*", length: 4 },
        "75": { instruction: "SHL", type: "register number.*", length: 4 },

        // SHLB
        "76": { instruction: "SHLB", type: "half.register half.register", length: 3 },
        "77": { instruction: "SHLB", type: "half.register memory.register", length: 4 },
        "78": { instruction: "SHLB", type: "half.register memory.number.*", length: 4 },
        "79": { instruction: "SHLB", type: "half.register number.*", length: 3 },

        // SHR
        "7A": { instruction: "SHR", type: "register register", length: 3 },
        "7B": { instruction: "SHR", type: "register memory.register", length: 4 },
        "7C": { instruction: "SHR", type: "register memory.number.*", length: 4 },
        "7D": { instruction: "SHR", type: "register number.*", length: 4 },

        // SHRB
        "7E": { instruction: "SHRB", type: "half.register half.register", length: 3 },
        "7F": { instruction: "SHRB", type: "half.register memory.register", length: 4 },
        "80": { instruction: "SHRB", type: "half.register memory.number.*", length: 4 },
        "81": { instruction: "SHRB", type: "half.register number.*", length: 3 },
    },

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
};