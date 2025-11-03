import { AssemblerError } from "../AssemblerError";

export const HexCalculator = {
    ADD: (first, second, options) => {
        const data = {
            length: options?.isHalf ? 2 : 4,
            max: options?.isHalf ? 0xFF : 0xFFFF
        };

        const result = (parseInt(first, 16) + parseInt(second, 16)) & data.max;
        return result.toString(16).toUpperCase().padStart(data.length, "0");
    },

    SUB: (first, second, options) => {
        const data = {
            length: options?.isHalf ? 2 : 4,
            max: options?.isHalf ? 0xFF : 0xFFFF
        };

        const result = (parseInt(first, 16) - parseInt(second, 16)) & data.max;
        return result.toString(16).toUpperCase().padStart(data.length, "0");
    },

    // Even though the following two functions don't need "second" as a parameter, for synchronization, it has to stay as a placeholder.
    INC: (first, _, options) => HexCalculator.ADD(first, "0001", options),
    DEC: (first, _, options) => HexCalculator.SUB(first, "0001", options),

    MUL: (first, second, options) => {
        const data = {
            length: options?.isHalf ? 2 : 4,
            max: options?.isHalf ? 0xFF : 0xFFFF
        };

        const result = (parseInt(first, 16) * parseInt(second, 16)) & data.max;
        return result.toString(16).toUpperCase().padStart(data.length, "0");
    },

    DIV: (first, second, options) => {
        const data = {
            length: options?.isHalf ? 2 : 4,
            max: options?.isHalf ? 0xFF : 0xFFFF
        };

        const intFirst = parseInt(first, 16);
        const intSecond = parseInt(second, 16);

        if(intFirst === 0) throw new AssemblerError("DivisionByZero");

        const result = Math.floor(intSecond / intFirst) & data.max;
        return result.toString(16).toUpperCase().padStart(data.length, "0");
    },

    AND: (first, second, options) => {
        const data = {
            length: options?.isHalf ? 2 : 4,
            max: options?.isHalf ? 0xFF : 0xFFFF
        };

        const result = (parseInt(first, 16) & parseInt(second, 16)) & data.max;
        return result.toString(16).toUpperCase().padStart(data.length, "0");
    },

    OR: (first, second, options) => {
        const data = {
            length: options?.isHalf ? 2 : 4,
            max: options?.isHalf ? 0xFF : 0xFFFF
        };

        const result = (parseInt(first, 16) | parseInt(second, 16)) & data.max;
        return result.toString(16).toUpperCase().padStart(data.length, "0");
    },

    XOR: (first, second, options) => {
        const data = {
            length: options?.isHalf ? 2 : 4,
            max: options?.isHalf ? 0xFF : 0xFFFF
        };

        const result = (parseInt(first, 16) ^ parseInt(second, 16)) & data.max;
        return result.toString(16).toUpperCase().padStart(data.length, "0");
    },

    NOT: (first, _, options) => {
        const data = {
            length: options?.isHalf ? 2 : 4,
            max: options?.isHalf ? 0xFF : 0xFFFF
        };

        const result = (~parseInt(first, 16)) & data.max;
        return result.toString(16).toUpperCase().padStart(data.length, "0");
    },

    SHL: (first, second, options) => {
        const data = {
            length: options?.isHalf ? 2 : 4,
            max: options?.isHalf ? 0xFF : 0xFFFF
        };

        const result = (parseInt(first, 16) << parseInt(second, 16)) & data.max;
        return result.toString(16).toUpperCase().padStart(data.length, "0");
    },

    SHR: (first, second, options) => {
        const data = {
            length: options?.isHalf ? 2 : 4,
            max: options?.isHalf ? 0xFF : 0xFFFF
        };

        const result = (parseInt(first, 16) >>> parseInt(second, 16)) & data.max; // >>> is used for unsigned shift right
        return result.toString(16).toUpperCase().padStart(data.length, "0");
    },

    // CMP relies on SR flags (Z and C).
    // Z is set to 1 if first === second, otherwise C is set to 1.
    CMP: (first, second) => {
        const flags = { Z: 0, C: 0 };

        const intFirst = parseInt(first, 16);
        const intSecond = parseInt(second, 16);

        if(intFirst === intSecond) flags.Z = 1;
        
        else {
            if(intFirst < intSecond) flags.C = 1;
            else flags.C = 0;
        }

        return flags;
    }
};