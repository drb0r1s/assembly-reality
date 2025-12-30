import { AssemblerError } from "../AssemblerError";

export class HexCalculator {
    constructor(cpuRegisters) {
        this.cpuRegisters = cpuRegisters;
    }

    ADD(first, second, options) {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const result = (first + second) & max;

        const SR = this.cpuRegisters.constructSR();
        
        SR.Z = result === 0 ? 1 : 0;
        SR.C = (first + second > max) ? 1 : 0;

        this.cpuRegisters.updateSR(SR);

        return result;
    }

    SUB(first, second, options) {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const result = (first - second) & max;

        const SR = this.cpuRegisters.constructSR();
        
        SR.Z = result === 0 ? 1 : 0;
        SR.C = first < second ? 1 : 0;

        this.cpuRegisters.updateSR(SR);

        return result;
    }

    // Even though the following two functions don't need "second" as a parameter, for synchronization, it has to stay as a placeholder.
    INC(first, _, options) {
        return this.ADD(first, 1, options);
    }

    DEC(first, _, options) {
        return this.SUB(first, 1, options);
    }

    MUL(first, second, options) {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const result = (first * second) & max;

        const SR = this.cpuRegisters.constructSR();
        
        SR.Z = result === 0 ? 1 : 0;
        SR.C = (first * second > max) ? 1 : 0;

        this.cpuRegisters.updateSR(SR);

        return result;
    }

    DIV(first, second, options) {
        if(first === 0) throw new AssemblerError("DivisionByZero");

        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const result = Math.floor(second / first) & max;

        const SR = this.cpuRegisters.constructSR();
        
        SR.Z = result === 0 ? 1 : 0;
        SR.C = 0;

        this.cpuRegisters.updateSR(SR);

        return result;
    }

    AND(first, second, options) {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const result = (first & second) & max;

        const SR = this.cpuRegisters.constructSR();

        SR.Z = result === 0 ? 1 : 0;
        SR.C = 0;
        
        this.cpuRegisters.updateSR(SR);

        return result;
    }

    OR(first, second, options) {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const result = (first | second) & max;

        const SR = this.cpuRegisters.constructSR();
        
        SR.Z = result === 0 ? 1 : 0;
        SR.C = 0;
        
        this.cpuRegisters.updateSR(SR);

        return result;
    }

    XOR(first, second, options) {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const result = (first ^ second) & max;

        const SR = this.cpuRegisters.constructSR();

        SR.Z = result === 0 ? 1 : 0;
        SR.C = 0;

        this.cpuRegisters.updateSR(SR);

        return result;
    }

    NOT(first, _, options) {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const result = (~first) & max;

        const SR = this.cpuRegisters.constructSR();

        SR.Z = result === 0 ? 1 : 0;
        SR.C = 0;

        this.cpuRegisters.updateSR(SR);

        return result;
    }

    SHL(first, second, options) {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const msb = options?.isHalf ? 0x80 : 0x8000;

        const result = (first << second) & max;

        const SR = this.cpuRegisters.constructSR();

        SR.Z = result === 0 ? 1 : 0;
        SR.C = (first & msb) ? 1 : 0;

        this.cpuRegisters.updateSR(SR);

        return result;
    }

    SHR(first, second, options) {
        const max = options?.isHalf ? 0xFF : 0xFFFF;
        const lsb = first & 1;

        const result = (first >>> second) & max;

        const SR = this.cpuRegisters.constructSR();

        SR.Z = result === 0 ? 1 : 0;
        SR.C = lsb;

        this.cpuRegisters.updateSR(SR);

        return result; // >>> is used for unsigned shift right
    }

    // CMP relies on SR flags (C and Z).
    // Z is set to 1 if first === second, otherwise C is set to 1.
    CMP(first, second) {
        const SR = this.cpuRegisters.constructSR();

        SR.Z = 0;
        SR.C = 0;

        if(first === second) SR.Z = 1;
        else if(first < second) SR.C = 1;

        this.cpuRegisters.updateSR(SR);
    }
}