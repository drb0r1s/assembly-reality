import { AssemblerError } from "../AssemblerError";

export const HexCalculator = {
    ADD: (assembler, first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const result = (first + second) & max;

        const SR = assembler.cpuRegisters.constructSR();
        
        SR.Z = result === 0 ? 1 : 0;
        SR.C = (first + second > max) ? 1 : 0;

        assembler.cpuRegisters.updateSR(SR);

        return result;
    },

    SUB: (assembler, first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const result = (first - second) & max;

        const SR = assembler.cpuRegisters.constructSR();
        
        SR.Z = result === 0 ? 1 : 0;
        SR.C = first < second ? 1 : 0;

        assembler.cpuRegisters.updateSR(SR);

        return result;
    },

    // Even though the following two functions don't need "second" as a parameter, for synchronization, it has to stay as a placeholder.
    INC: (assembler, first, _, options) => HexCalculator.ADD(assembler, first, 1, options),
    DEC: (assembler, first, _, options) => HexCalculator.SUB(assembler, first, 1, options),

    MUL: (assembler, first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const result = (first * second) & max;

        const SR = assembler.cpuRegisters.constructSR();
        
        SR.Z = result === 0 ? 1 : 0;
        SR.C = (first * second > max) ? 1 : 0;

        assembler.cpuRegisters.updateSR(SR);

        return result;
    },

    DIV: (assembler, first, second, options) => {
        if(first === 0) throw new AssemblerError("DivisionByZero");

        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const result = Math.floor(second / first) & max;

        const SR = assembler.cpuRegisters.constructSR();
        
        SR.Z = result === 0 ? 1 : 0;
        SR.C = 0;

        assembler.cpuRegisters.updateSR(SR);

        return result;
    },

    AND: (assembler, first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const result = (first & second) & max;

        const SR = assembler.cpuRegisters.constructSR();

        SR.Z = result === 0 ? 1 : 0;
        SR.C = 0;
        
        assembler.cpuRegisters.updateSR(SR);

        return result;
    },

    OR: (assembler, first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const result = (first | second) & max;

        const SR = assembler.cpuRegisters.constructSR();
        
        SR.Z = result === 0 ? 1 : 0;
        SR.C = 0;
        
        assembler.cpuRegisters.updateSR(SR);

        return result;
    },

    XOR: (assembler, first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const result = (first ^ second) & max;

        const SR = assembler.cpuRegisters.constructSR();

        SR.Z = result === 0 ? 1 : 0;
        SR.C = 0;

        assembler.cpuRegisters.updateSR(SR);

        return result;
    },

    NOT: (assembler, first, _, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const result = (~first) & max;

        const SR = assembler.cpuRegisters.constructSR();

        SR.Z = result === 0 ? 1 : 0;
        SR.C = 0;

        assembler.cpuRegisters.updateSR(SR);

        return result;
    },

    SHL: (assembler, first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const msb = options?.isHalf ? 0x80 : 0x8000;

        const result = (first << second) & max;

        const SR = assembler.cpuRegisters.constructSR();

        SR.Z = result === 0 ? 1 : 0;
        SR.C = (first & msb) ? 1 : 0;

        assembler.cpuRegisters.updateSR(SR);

        return result;
    },

    SHR: (assembler, first, second, options) => {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const lsb = first & 1;

        const result = (first >>> second) & max;

        const SR = assembler.cpuRegisters.constructSR();

        SR.Z = result === 0 ? 1 : 0;
        SR.C = lsb;

        assembler.cpuRegisters.updateSR(SR);

        return result; // >>> is used for unsigned shift right
    },

    // CMP relies on SR flags (C and Z).
    // Z is set to 1 if first === second, otherwise C is set to 1.
    CMP: (assembler, first, second) => {
        const SR = assembler.cpuRegisters.constructSR();

        SR.Z = 0;
        SR.C = 0;

        if(first === second) SR.Z = 1;
        else if(first < second) SR.C = 1;

        assembler.cpuRegisters.updateSR(SR);
    }
};