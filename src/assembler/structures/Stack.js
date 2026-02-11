import { AssemblerError } from "../AssemblerError";

export class Stack {
    constructor(cpuRegisters, ram) {
        this.cpuRegisters = cpuRegisters;
        this.ram = ram;
    }

    push(value, isHalf = false) {
        let SP = this.cpuRegisters.getValue("SP");
        
        this.ram.matrix.update(SP, value, isHalf, true);

        const numberOfCells = isHalf ? 1 : 2;
        SP -= numberOfCells;

        this.cpuRegisters.update("SP", SP);
    }

    pop(popRegister, isHalf = false) {
        let SP = this.cpuRegisters.getValue("SP");

        const numberOfCells = isHalf ? 1 : 2;
        SP += numberOfCells;
        
        if(SP > this.ram.stackStart) throw new AssemblerError("StackUnderflow", [], null, this.cpuRegisters);
        
        this.cpuRegisters.update("SP", SP);
        
        const popped = this.ram.matrix.point(SP, isHalf, true);
        if(popRegister) this.cpuRegisters.update(popRegister, popped);

        return popped;
    }
}