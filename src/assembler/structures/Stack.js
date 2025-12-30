import { AssemblerError } from "../AssemblerError";

export class Stack {
    constructor(cpuRegisters, ram) {
        this.cpuRegisters = cpuRegisters;
        this.ram = ram;
    }

    push(value, options) {
        const isHalf = options?.isHalf ? options.isHalf : false;
        
        this.ram.matrix.update(this.cpuRegisters.getValue("SP"), value, { isHalf, isStack: true });

        const numberOfCells = isHalf ? 1 : 2;
        this.cpuRegisters.update("SP", this.cpuRegisters.getValue("SP") - numberOfCells);
    }

    pop(popRegister, options) {
        const isHalf = options?.isHalf ? options.isHalf : false;
        const numberOfCells = isHalf ? 1 : 2;
        
        if(this.cpuRegisters.getValue("SP") + numberOfCells > this.ram.stackStart) throw new AssemblerError("StackUnderflow");
        
        this.cpuRegisters.update("SP", this.cpuRegisters.getValue("SP") + numberOfCells);
        
        const popped = this.ram.matrix.point(this.cpuRegisters.getValue("SP"), { isHalf, isStack: true });
        if(popRegister) this.cpuRegisters.update(popRegister, popped);

        return popped;
    }
}