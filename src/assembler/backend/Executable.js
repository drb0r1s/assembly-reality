import { AssemblerError } from "../AssemblerError";
import { Decoder } from "./Decoder";
import { HexCalculator } from "./HexCalculator";

export const Executable = {
    halt: assembler => {
        assembler.isHalted = true;
    },

    move: (assembler, executable, args) => {
        const { first, second } = Decoder.decode(assembler, executable, args);

        const [isHalf] = isInstructionHalf(executable.instruction);
        const registerType = isHalf ? "half.register" : "register";

        // In case of updating the stack pointer register, we need to adjust the memory.stackStart address.
        if(first?.register === "SP") updateStackStart(assembler, executable, second);
        
        Decoder.run(executable, {
            [`${registerType} ${registerType}`]: () => assembler.cpuRegisters.update(first.register, second.registerValue),
            [`${registerType} memory.register`]: () => assembler.cpuRegisters.update(first.register, second.memoryPoint),
            [`${registerType} memory.number.*`]: () => assembler.cpuRegisters.update(first.register, second.memoryPoint),
            [`memory.register ${registerType}`]: () => assembler.memory.rewrite(first.registerValue, second.registerValue, { isHalf }),
            [`memory.number.* ${registerType}`]: () => assembler.memory.rewrite(first.value, second.registerValue, { isHalf }),
            [`${registerType} number.*`]: () => assembler.cpuRegisters.update(first.register, second.value),
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
                assembler.cpuRegisters.update(usedRegister.register, operation);
            },

            "memory.register": () => {
                const operation = HexCalculator[instruction](first.memoryPoint, usedRegister.registerValue, { isHalf });
                assembler.cpuRegisters.update(usedRegister.register, operation);
            },

            "memory.number.*": () => {
                const operation = HexCalculator[instruction](first.memoryPoint, usedRegister.registerValue, { isHalf });
                assembler.cpuRegisters.update(usedRegister.register, operation);
            },

            "number.*": () => {
                const operation = HexCalculator[instruction](first.value, usedRegister.registerValue, { isHalf });
                assembler.cpuRegisters.update(usedRegister.register, operation);
            },
            
            // TWO OPERANDS
            [`${registerType} ${registerType}`]: () => {
                const operation = HexCalculator[instruction](first.registerValue, second.registerValue, { isHalf });
                assembler.cpuRegisters.update(first.register, operation);
            },
        
            [`${registerType} memory.register`]: () => {
                const operation = HexCalculator[instruction](first.registerValue, second.memoryPoint, { isHalf });
                assembler.cpuRegisters.update(first.register, operation);
            },
        
            [`${registerType} memory.number.*`]: () => {
                const operation = HexCalculator[instruction](first.registerValue, second.memoryPoint, { isHalf });
                assembler.cpuRegisters.update(first.register, operation);
            },
        
            [`${registerType} number.*`]: () => {
                const operation = HexCalculator[instruction](first.registerValue, second.value, { isHalf });
                assembler.cpuRegisters.update(first.register, operation);
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
                assembler.cpuRegisters.update("SR", {...assembler.cpuRegisters.SR, ...flags});
            },

            [`${registerType} memory.register`]: () => {
                const flags = HexCalculator.CMP(first.registerValue, second.memoryPoint);
                assembler.cpuRegisters.update("SR", {...assembler.cpuRegisters.SR, ...flags});
            },

            [`${registerType} memory.number.*`]: () => {
                const flags = HexCalculator.CMP(first.registerValue, second.memoryPoint);
                assembler.cpuRegisters.update("SR", {...assembler.cpuRegisters.SR, ...flags});
            },

            [`${registerType} number.*`]: () => {
                const flags = HexCalculator.CMP(first.registerValue, second.value);
                assembler.cpuRegisters.update("SR", {...assembler.cpuRegisters.SR, ...flags});
            }
        });
    },

    jump: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        switch(executable.instruction) {
            case "JC":
                if(assembler.cpuRegisters.SR.C === 0) return;
                break;
            case "JNC":
                if(assembler.cpuRegisters.SR.C === 1) return;
                break;
            case "JZ":
                if(assembler.cpuRegisters.SR.Z === 0) return;
                break;
            case "JNZ":
                if(assembler.cpuRegisters.SR.Z === 1) return;
                break;
            case "JA":
                if(assembler.cpuRegisters.SR.C !== 0 || assembler.cpuRegisters.SR.Z !== 0) return;
                break;
            case "JNA":
                if(assembler.cpuRegisters.SR.C !== 1 && assembler.cpuRegisters.SR.Z !== 1) return;
                break;
        }

        Decoder.run(executable, {
            "memory.register": () => {
                assembler.cpuRegisters.update("IP", first.memoryPoint);
            },

            "number.*": () => {
                assembler.cpuRegisters.update("IP", first.value);
            }
        });
    },

    push: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        const [isHalf] = isInstructionHalf(executable.instruction);
        const registerType = isHalf ? "half.register" : "register";

        Decoder.run(executable, {
            [registerType]: () => {
                assembler.memory.rewrite(assembler.cpuRegisters.SP, first.registerValue, { isHalf, isStack: true });

                const numberOfCells = isHalf ? 1 : 2;
                assembler.cpuRegisters.update("SP", assembler.cpuRegisters.SP - numberOfCells);
            },

            "number.*": () => {
                assembler.memory.rewrite(assembler.cpuRegisters.SP, first.value, { isHalf, isStack: true });

                const numberOfCells = isHalf ? 1 : 2;
                assembler.cpuRegisters.update("SP", assembler.cpuRegisters.SP - numberOfCells);
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

                if(assembler.cpuRegisters.SP + numberOfCells > assembler.memory.stackStart) throw new AssemblerError("StackUnderflow");

                assembler.cpuRegisters.update("SP", assembler.cpuRegisters.SP + numberOfCells);

                const popped = assembler.memory.point(assembler.cpuRegisters.SP, { isHalf, isStack: true });
                assembler.cpuRegisters.update(first.register, popped);
            }
        });
    },

    call: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "memory.register": () => {
                // IMPORTANT: Here we set the current (return) address as the next address that should be executed, after the RET instruction.
                // If we didn't specify that we want to return to the next address, we would ran into an infinite loop, as function would keep calling itself.
                const currentAddress = assembler.cpuRegisters.IP + 3;

                assembler.cpuRegisters.update("IP", first.memoryPoint);

                // PUSH return address to the stack.
                assembler.memory.rewrite(assembler.cpuRegisters.SP, currentAddress, { isStack: true });
                assembler.cpuRegisters.update("SP", assembler.cpuRegisters.SP - 2);
            },

            "number.*": () => {
                // IMPORTANT: Here we set the current (return) address as the next address that should be executed, after the RET instruction.
                // If we didn't specify that we want to return to the next address, we would ran into an infinite loop, as function would keep calling itself.
                const currentAddress = assembler.cpuRegisters.IP + 3;

                assembler.cpuRegisters.update("IP", first.value);

                // PUSH return address to the stack.
                assembler.memory.rewrite(assembler.cpuRegisters.SP, currentAddress, { isStack: true });
                assembler.cpuRegisters.update("SP", assembler.cpuRegisters.SP - 2);
            }
        });
    },

    ret: assembler => {
        // POP the return address from the stack.
        assembler.cpuRegisters.update("SP", assembler.cpuRegisters.SP + 2);
        
        const popped = assembler.memory.point(assembler.cpuRegisters.SP, { isStack: true });
        assembler.cpuRegisters.update("IP", popped);
    },

    in: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "register": () => {
                const ioRegisterValue = assembler.ioRegisters.getValueByIndex(first.registerValue);
                assembler.cpuRegisters.update("A", ioRegisterValue);
            },

            "memory.register": () => {
                const ioRegisterValue = assembler.ioRegisters.getValueByIndex(first.memoryPoint);
                assembler.cpuRegisters.update("A", ioRegisterValue);
            },

            "memory.number.*": () => {
                const ioRegisterValue = assembler.ioRegisters.getValueByIndex(first.memoryPoint);
                assembler.cpuRegisters.update("A", ioRegisterValue);
            },

            "number.*": () => {
                const ioRegisterValue = assembler.ioRegisters.getValueByIndex(first.value);
                assembler.cpuRegisters.update("A", ioRegisterValue);
            }
        });
    },

    out: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "register": () => {
                const ioRegister = assembler.ioRegisters.get(first.registerValue);
                assembler.ioRegisters.update(ioRegister, assembler.cpuRegisters.A);
            },

            "memory.register": () => {
                const ioRegister = assembler.ioRegisters.get(first.memoryPoint);
                assembler.ioRegisters.update(ioRegister, assembler.cpuRegisters.A);
            },

            "memory.number.*": () => {
                const ioRegister = assembler.ioRegisters.get(first.memoryPoint);
                assembler.ioRegisters.update(ioRegister, assembler.cpuRegisters.A);
            },

            "number.*": () => {
                const ioRegister = assembler.ioRegisters.get(first.value);
                assembler.ioRegisters.update(ioRegister, assembler.cpuRegisters.A);
            }
        });
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

    usedRegister.registerValue = assembler.cpuRegisters.getValue(usedRegister.register);

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

    if(value > assembler.cpuRegisters.SP) assembler.memory.stackStart = value;
}