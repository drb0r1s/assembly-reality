import { AssemblerError } from "../AssemblerError";

export class HexCalculator {
    constructor(cpuRegisters) {
        this.cpuRegisters = cpuRegisters;
    }

    ADD(first, second, isHalf) {
        const max = isHalf ? 0xFF : 0xFFFF;
        const result = (first + second) & max;

        const SR = this.cpuRegisters.constructSR();
        
        SR.Z = result === 0 ? 1 : 0;
        SR.C = (first + second > max) ? 1 : 0;

        this.cpuRegisters.updateSR(SR);

        return result;
    }

    SUB(first, second, isHalf) {
        const max = isHalf ? 0xFF : 0xFFFF;
        const result = (first - second) & max;

        const SR = this.cpuRegisters.constructSR();
        
        SR.Z = result === 0 ? 1 : 0;
        SR.C = first < second ? 1 : 0;

        this.cpuRegisters.updateSR(SR);

        return result;
    }

    // Even though the following two functions don't need "second" as a parameter, for synchronization, it has to stay as a placeholder.
    INC(first, _, isHalf) {
        return this.ADD(first, 1, isHalf);
    }

    DEC(first, _, isHalf) {
        return this.SUB(first, 1, isHalf);
    }

    MUL(first, second, isHalf) {
        const max = isHalf ? 0xFF : 0xFFFF;
        const result = (first * second) & max;

        const SR = this.cpuRegisters.constructSR();
        
        SR.Z = result === 0 ? 1 : 0;
        SR.C = (first * second > max) ? 1 : 0;

        this.cpuRegisters.updateSR(SR);

        return result;
    }

    DIV(first, second, isHalf) {
        if(first === 0) throw new AssemblerError("DivisionByZero");

        const max = isHalf ? 0xFF : 0xFFFF;
        const result = Math.floor(second / first) & max;

        const SR = this.cpuRegisters.constructSR();
        
        SR.Z = result === 0 ? 1 : 0;
        SR.C = 0;

        this.cpuRegisters.updateSR(SR);

        return result;
    }

    AND(first, second, isHalf) {
        const max = isHalf ? 0xFF : 0xFFFF;
        const result = (first & second) & max;

        const SR = this.cpuRegisters.constructSR();

        SR.Z = result === 0 ? 1 : 0;
        SR.C = 0;
        
        this.cpuRegisters.updateSR(SR);

        return result;
    }

    OR(first, second, isHalf) {
        const max = isHalf ? 0xFF : 0xFFFF;
        const result = (first | second) & max;

        const SR = this.cpuRegisters.constructSR();
        
        SR.Z = result === 0 ? 1 : 0;
        SR.C = 0;
        
        this.cpuRegisters.updateSR(SR);

        return result;
    }

    XOR(first, second, isHalf) {
        const max = isHalf ? 0xFF : 0xFFFF;
        const result = (first ^ second) & max;

        const SR = this.cpuRegisters.constructSR();

        SR.Z = result === 0 ? 1 : 0;
        SR.C = 0;

        this.cpuRegisters.updateSR(SR);

        return result;
    }

    NOT(first, _, isHalf) {
        const max = isHalf ? 0xFF : 0xFFFF;
        const result = (~first) & max;

        const SR = this.cpuRegisters.constructSR();

        SR.Z = result === 0 ? 1 : 0;
        SR.C = 0;

        this.cpuRegisters.updateSR(SR);

        return result;
    }

    SHL(first, second, isHalf) {
        const max = isHalf ? 0xFF : 0xFFFF;
        const msb = isHalf ? 0x80 : 0x8000;

        const result = (first << second) & max;

        const SR = this.cpuRegisters.constructSR();

        SR.Z = result === 0 ? 1 : 0;
        SR.C = (first & msb) ? 1 : 0;

        this.cpuRegisters.updateSR(SR);

        return result;
    }

    SHR(first, second, isHalf) {
        const max = isHalf ? 0xFF : 0xFFFF;
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