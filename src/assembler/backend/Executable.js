import { AssemblerError } from "../AssemblerError";
import { Decoder } from "./Decoder";
import { HexCalculator } from "./HexCalculator";

export const Executable = {
    move: (assembler, executable, args) => {
        const { first, second } = Decoder.decode(assembler, executable, args);

        const [isHalf] = isInstructionHalf(executable.instruction);
        const registerType = isHalf ? "half.register" : "register";

        // In case of updating the stack pointer register, we need to adjust the memory.stackStart address.
        if(first?.register === "SP") updateStackStart(assembler, executable, second);
        
        Decoder.run(executable, {
            [`${registerType} ${registerType}`]: () => assembler.registers.update(first.register, second.registerValue),
            [`${registerType} memory.register`]: () => assembler.registers.update(first.register, second.memoryPoint),
            [`${registerType} memory.number.*`]: () => assembler.registers.update(first.register, second.memoryPoint),
            [`memory.register ${registerType}`]: () => assembler.memory.rewrite(first.registerValue, second.registerValue, { isHalf }),
            [`memory.number.* ${registerType}`]: () => assembler.memory.rewrite(first.value, second.registerValue, { isHalf }),
            [`${registerType} number.*`]: () => assembler.registers.update(first.register, second.value),
            "memory.register number.*": () => assembler.memory.rewrite(first.registerValue, second.value, { isHalf }),
            "memory.number.* number.*": () => assembler.memory.rewrite(first.value, second.value, { isHalf })
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
            [registerType]: () => {
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
    },

    compare: (assembler, executable, args) => {
        const { first, second } = Decoder.decode(assembler, executable, args);
    
        const [isHalf] = isInstructionHalf(executable.instruction);
        const registerType = isHalf ? "half.register" : "register";

        Decoder.run(executable, {
            [`${registerType} ${registerType}`]: () => {
                const flags = HexCalculator.CMP(first.registerValue, second.registerValue);
                assembler.registers.update("SR", {...assembler.registers.SR, ...flags});
            },

            [`${registerType} memory.register`]: () => {
                const flags = HexCalculator.CMP(first.registerValue, second.memoryPoint);
                assembler.registers.update("SR", {...assembler.registers.SR, ...flags});
            },

            [`${registerType} memory.number.*`]: () => {
                const flags = HexCalculator.CMP(first.registerValue, second.memoryPoint);
                assembler.registers.update("SR", {...assembler.registers.SR, ...flags});
            },

            [`${registerType} number.*`]: () => {
                const flags = HexCalculator.CMP(first.registerValue, second.value);
                assembler.registers.update("SR", {...assembler.registers.SR, ...flags});
            }
        });
    },

    jump: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        switch(executable.instruction) {
            case "JC":
                if(assembler.registers.SR.C === 0) return;
                break;
            case "JNC":
                if(assembler.registers.SR.C === 1) return;
                break;
            case "JZ":
                if(assembler.registers.SR.Z === 0) return;
                break;
            case "JNZ":
                if(assembler.registers.SR.Z === 1) return;
                break;
            case "JA":
                if(assembler.registers.SR.C !== 0 || assembler.registers.SR.Z !== 0) return;
                break;
            case "JNA":
                if(assembler.registers.SR.C !== 1 && assembler.registers.SR.Z !== 1) return;
                break;
        }

        Decoder.run(executable, {
            "memory.register": () => {
                assembler.memory.adjustInstructionIndex(first.memoryPoint);
            },

            "number.*": () => {
                assembler.memory.adjustInstructionIndex(first.value);
            }
        });
    },

    push: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        const [isHalf] = isInstructionHalf(executable.instruction);
        const registerType = isHalf ? "half.register" : "register";

        Decoder.run(executable, {
            [registerType]: () => {
                assembler.memory.rewrite(assembler.registers.SP, first.registerValue, { isHalf, isStack: true });

                const numberOfCells = isHalf ? 1 : 2;
                assembler.registers.update("SP", assembler.registers.SP - numberOfCells);
            },

            "number.*": () => {
                assembler.memory.rewrite(assembler.registers.SP, first.value, { isHalf, isStack: true });

                const numberOfCells = isHalf ? 1 : 2;
                assembler.registers.update("SP", assembler.registers.SP - numberOfCells);
            }
        });
    },

    pop: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        const [isHalf] = isInstructionHalf(executable.instruction);
        const registerType = isHalf ? "half.register" : "register";

        Decoder.run(executable, {
            [registerType]: () => {
                const numberOfCells = isHalf ? 1 : 2;

                if(assembler.registers.SP + numberOfCells > assembler.memory.stackStart) throw new AssemblerError("StackUnderflow");

                assembler.registers.update("SP", assembler.registers.SP + numberOfCells);

                const popped = assembler.memory.point(assembler.registers.SP, { isHalf, isStack: true });
                assembler.registers.update(first.register, popped);
            }
        });
    },

    call: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "memory.register": () => {
                const currentAddress = assembler.registers.IP + 4;

                assembler.memory.adjustInstructionIndex(first.memoryPoint);

                // PUSH return address to the stack.
                assembler.memory.rewrite(assembler.registers.SP, currentAddress, { isStack: true });
                assembler.registers.update("SP", assembler.registers.SP - 2);
            },

            "number.*": () => {
                const currentAddress = assembler.registers.IP + 4;

                assembler.memory.adjustInstructionIndex(first.value);

                // PUSH return address to the stack.
                assembler.memory.rewrite(assembler.registers.SP, currentAddress, { isStack: true });
                assembler.registers.update("SP", assembler.registers.SP - 2);
            }
        });
    },

    ret: (assembler, executable, args) => {
        // POP the return address from the stack.
        assembler.registers.update("SP", assembler.registers.SP + 2);
        
        const popped = assembler.memory.point(assembler.registers.SP, { isStack: true });
        assembler.memory.adjustInstructionIndex(popped);
    }
};

function isInstructionHalf(instruction) {
    const exceptions = ["SUB", "JB", "JNB"];
    if(exceptions.indexOf(instruction) > -1) return [false, instruction];

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

function updateStackStart(assembler, executable, second) {
    const secondType = executable.type.split(" ")[1];
    let value;

    switch(secondType) {
        case "register":
            value = second.registerValue;
            break;
        case "memory.register":
        case "memory.number.*":
            value = second.memoryPoint;
            break;
        case "number.*":
            value = second.value;
            break;
    }

    if(value > assembler.registers.SP) assembler.memory.stackStart = value;
}