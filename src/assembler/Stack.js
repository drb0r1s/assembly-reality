import { AssemblerError } from "./AssemblerError";

export const Stack = {
    push: (assembler, value, options) => {
        const isHalf = options?.isHalf ? options.isHalf : false;
        
        assembler.memory.matrix.update(assembler.cpuRegisters.getValue("SP"), value, { isHalf, isStack: true });

        const numberOfCells = isHalf ? 1 : 2;
        assembler.cpuRegisters.update("SP", assembler.cpuRegisters.getValue("SP") - numberOfCells);
    },

    pop: (assembler, popRegister, options) => {
        const isHalf = options?.isHalf ? options.isHalf : false;
        const numberOfCells = isHalf ? 1 : 2;
        
        if(assembler.cpuRegisters.getValue("SP") + numberOfCells > assembler.memory.stackStart) throw new AssemblerError("StackUnderflow");
        
        assembler.cpuRegisters.update("SP", assembler.cpuRegisters.getValue("SP") + numberOfCells);
        
        const popped = assembler.memory.matrix.point(assembler.cpuRegisters.getValue("SP"), { isHalf, isStack: true });
        if(popRegister) assembler.cpuRegisters.update(popRegister, popped);

        return popped;
    }
};