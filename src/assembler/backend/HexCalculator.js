import { AssemblerError } from "../AssemblerError";

export const HexCalculator = {
    add: (first, second, options) => {
        const data = {
            length: options?.isHalf ? 2 : 4,
            max: options?.isHalf ? 0xFF : 0xFFFF
        };

        const result = (parseInt(first, 16) + parseInt(second, 16)) & data.max;
        return result.toString(16).toUpperCase().padStart(data.length, "0");
    },

    sub: (first, second, options) => {
        const data = {
            length: options?.isHalf ? 2 : 4,
            max: options?.isHalf ? 0xFF : 0xFFFF
        };

        const result = (parseInt(first, 16) - parseInt(second, 16)) & data.max;
        return result.toString(16).toUpperCase().padStart(data.length, "0");
    },

    mul: (first, second, options) => {
        const data = {
            length: options?.isHalf ? 2 : 4,
            max: options?.isHalf ? 0xFF : 0xFFFF
        };

        const result = (parseInt(first, 16) * parseInt(second, 16)) & data.max;
        return result.toString(16).toUpperCase().padStart(data.length, "0");
    },

    div: (first, second, options) => {
        const data = {
            length: options?.isHalf ? 2 : 4,
            max: options?.isHalf ? 0xFF : 0xFFFF
        };

        const intFirst = parseInt(first, 16);
        const intSecond = parseInt(second, 16);

        if(intSecond === 0) throw new AssemblerError("DivisionByZero");

        const result = Math.floor(intFirst / intSecond) & data.max;
        return result.toString(16).toUpperCase().padStart(data.length, "0");
    },

    and: (first, second, options) => {
        const data = {
            length: options?.isHalf ? 2 : 4,
            max: options?.isHalf ? 0xFF : 0xFFFF
        };

        const result = (parseInt(first, 16) & parseInt(second, 16)) & data.max;
        return result.toString(16).toUpperCase().padStart(data.length, "0");
    }
};