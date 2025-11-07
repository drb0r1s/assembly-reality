import { AssemblerError } from "../AssemblerError";

export const HexCalculator = {
    ADD: (first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF
        return (first + second) & max;
    },

    SUB: (first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF
        return (first - second) & max;
    },

    // Even though the following two functions don't need "second" as a parameter, for synchronization, it has to stay as a placeholder.
    INC: (first, _, options) => HexCalculator.ADD(first, 1, options),
    DEC: (first, _, options) => HexCalculator.SUB(first, 1, options),

    MUL: (first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF
        return (first * second) & max;
    },

    DIV: (first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF

        if(first === 0) throw new AssemblerError("DivisionByZero");
        return Math.floor(second / first) & max;
    },

    AND: (first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF
        return (first & second) & max;
    },

    OR: (first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF
        return (first | second) & max;
    },

    XOR: (first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF
        return (first ^ second) & max;
    },

    NOT: (first, _, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF
        return (~first) & max;
    },

    SHL: (first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF
        return (first << second) & max;
    },

    SHR: (first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF
        return (first >>> second) & max; // >>> is used for unsigned shift right
    },

    // CMP relies on SR flags (Z and C).
    // Z is set to 1 if first === second, otherwise C is set to 1.
    CMP: (first, second) => {
        const flags = { Z: 0, C: 0 };

        if(first === second) flags.Z = 1;
        
        else {
            if(first < second) flags.C = 1;
            else flags.C = 0;
        }

        return flags;
    }
};