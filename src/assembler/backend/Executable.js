import { Decoder } from "./Decoder";
import { HexCalculator } from "./HexCalculator";

export const Executable = {
    move: (assembler, executable, args) => {
        const { first, second } = Decoder.decode(assembler, executable, args);

        const [isHalf] = isInstructionHalf(executable.instruction);
        const registerType = isHalf ? "half.register" : "register";
        
        Decoder.run(executable, {
            [`${registerType} ${registerType}`]: () => assembler.registers.update(first.register, second.registerValue),
            [`${registerType} memory.register`]: () => assembler.registers.update(first.register, second.memoryPoint),
            [`${registerType} memory.number.*`]: () => assembler.registers.update(first.register, second.memoryPoint),
            [`memory.register ${registerType}`]: () => assembler.memory.rewrite(first.registerValue, second.registerValue),
            [`memory.number.* ${registerType}`]: () => assembler.memory.rewrite(first.value, second.registerValue),
            [`${registerType} number.*`]: () => assembler.registers.update(first.register, second.value),
            "memory.register number.*": () => assembler.memory.rewrite(first.registerValue, second.value),
            "memory.number.* number.*": () => assembler.memory.rewrite(first.value, second.value)
        });
    },

    bitwise: (assembler, executable, args) => {
        const { first, second } = Decoder.decode(assembler, executable, args);
        
        // The only purpose we need "instruction" here is that we can get the name of the instruction without the "B" at the end, so that we can call HexCalculator (if the instruction is half).
        const [isHalf, instruction] = isInstructionHalf(executable.instruction);

        // The only purpose of usedRegister is to detect the use of instruction which are implemented only on register A, and to return register ("A" or "AL") and its value in that case.
        const usedRegister = getUsedRegister(assembler, executable.instruction, isHalf, first.register);
        const registerType = isHalf ? "half.register" : "register";

        Decoder.run(executable, {
            // ONE OPERAND
            [`${registerType}`]: () => {
                const operation = HexCalculator[instruction](first.registerValue, usedRegister.registerValue, { isHalf });
                assembler.registers.update(usedRegister.register, operation);
            },

            "memory.register": () => {
                const operation = HexCalculator[instruction](first.memoryPoint, usedRegister.registerValue, { isHalf });
                assembler.registers.update(usedRegister.register, operation);
            },

            "memory.number.*": () => {
                const operation = HexCalculator[instruction](first.memoryPoint, usedRegister.registerValue, { isHalf });
                assembler.registers.update(usedRegister.register, operation);
            },

            "number.*": () => {
                const operation = HexCalculator[instruction](first.value, usedRegister.registerValue, { isHalf });
                assembler.registers.update(usedRegister.register, operation);
            },
            
            // TWO OPERANDS
            [`${registerType} ${registerType}`]: () => {
                const operation = HexCalculator[instruction](first.registerValue, second.registerValue, { isHalf });
                assembler.registers.update(first.register, operation);
            },
        
            [`${registerType} memory.register`]: () => {
                const operation = HexCalculator[instruction](first.registerValue, second.memoryPoint, { isHalf });
                assembler.registers.update(first.register, operation);
            },
        
            [`${registerType} memory.number.*`]: () => {
                const operation = HexCalculator[instruction](first.registerValue, second.memoryPoint, { isHalf });
                assembler.registers.update(first.register, operation);
            },
        
            [`${registerType} number.*`]: () => {
                const operation = HexCalculator[instruction](first.registerValue, second.value, { isHalf });
                assembler.registers.update(first.register, operation);
            }
        });
    }
};

function isInstructionHalf(instruction) {
    if(instruction === "SUB") return [false, instruction]; // This is the edge case, the only instruction ending with "B" that should not be considered half.

    const last = instruction.slice(-1);
    if(last === "B") return [true, instruction.slice(0, -1)];

    return [false, instruction];
}

function getUsedRegister(assembler, instruction, isHalf, register) {
    const usedRegister = { register: null, registerValue: null };
    
    const registerAInstructions = ["MUL", "MULB", "DIV", "DIVB"];

    if(registerAInstructions.indexOf(instruction) > -1) {
        if(isHalf) usedRegister.register = "AL";
        else usedRegister.register = "A";
    }

    else usedRegister.register = register;

    usedRegister.registerValue = assembler.registers.getValue(usedRegister.register);

    return usedRegister;
}