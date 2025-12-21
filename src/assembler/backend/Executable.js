import { Decoder } from "./Decoder";
import { HexCalculator } from "./HexCalculator";
import { Stack } from "../Stack";

export const Executable = {
    halt: assembler => {
        assembler.isHalted = true;
        // 0b00001 only because H flag is the last one in the SR sequence.
        assembler.cpuRegisters.update("SR", assembler.cpuRegisters.getValue("SR") | 0b00001);
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
            [`memory.register ${registerType}`]: () => assembler.ram.matrix.update(first.registerValue, second.registerValue, { isHalf }),
            [`memory.number.* ${registerType}`]: () => assembler.ram.matrix.update(first.value, second.registerValue, { isHalf }),
            [`${registerType} number.*`]: () => assembler.cpuRegisters.update(first.register, second.value),
            "memory.register number.*": () => assembler.ram.matrix.update(first.registerValue, second.value, { isHalf }),
            "memory.number.* number.*": () => assembler.ram.matrix.update(first.value, second.value, { isHalf })
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
                const flags = HexCalculator.CMP(assembler, first.registerValue, second.registerValue);
                assembler.cpuRegisters.update("SR", flags);
            },

            [`${registerType} memory.register`]: () => {
                const flags = HexCalculator.CMP(assembler, first.registerValue, second.memoryPoint);
                assembler.cpuRegisters.update("SR", flags);
            },

            [`${registerType} memory.number.*`]: () => {
                const flags = HexCalculator.CMP(assembler, first.registerValue, second.memoryPoint);
                assembler.cpuRegisters.update("SR", flags);
            },

            [`${registerType} number.*`]: () => {
                const flags = HexCalculator.CMP(assembler, first.registerValue, second.value);
                assembler.cpuRegisters.update("SR", flags);
            }
        });
    },

    jump: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);
        const SR = assembler.cpuRegisters.constructSR();

        switch(executable.instruction) {
            case "JC":
                if(SR.C === 0) return;
                break;
            case "JNC":
                if(SR.C === 1) return;
                break;
            case "JZ":
                if(SR.Z === 0) return;
                break;
            case "JNZ":
                if(SR.Z === 1) return;
                break;
            case "JA":
                if(SR.C !== 0 || SR.Z !== 0) return;
                break;
            case "JNA":
                if(SR.C !== 1 && SR.Z !== 1) return;
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
            [registerType]: () => Stack.push(assembler, first.registerValue, { isHalf }),
            "number.*": () => Stack.push(assembler, first.value, { isHalf })
        });
    },

    pop: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        const [isHalf] = isInstructionHalf(executable.instruction);
        const registerType = isHalf ? "half.register" : "register";

        Decoder.run(executable, {
            [registerType]: () => Stack.pop(assembler, first.register, { isHalf })
        });
    },

    call: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "memory.register": () => {
                // IMPORTANT: Here we set the current (return) address as the next address that should be executed, after the RET instruction.
                // If we didn't specify that we want to return to the next address, we would ran into an infinite loop, as function would keep calling itself.
                const currentAddress = assembler.cpuRegisters.getValue("IP") + 3;

                assembler.cpuRegisters.update("IP", first.memoryPoint);

                Stack.push(assembler, currentAddress); // PUSH return address to the stack.
            },

            "number.*": () => {
                // IMPORTANT: Here we set the current (return) address as the next address that should be executed, after the RET instruction.
                // If we didn't specify that we want to return to the next address, we would ran into an infinite loop, as function would keep calling itself.
                const currentAddress = assembler.cpuRegisters.getValue("IP") + 3;

                assembler.cpuRegisters.update("IP", first.value);

                Stack.push(assembler, currentAddress); // PUSH return address to the stack.
            }
        });
    },

    ret: assembler => {
        // POP the return address from the stack.
        assembler.cpuRegisters.update("SP", assembler.cpuRegisters.getValue("SP") + 2);
        
        const popped = assembler.ram.matrix.point(assembler.cpuRegisters.getValue("SP"), { isStack: true });
        assembler.cpuRegisters.update("IP", popped);
    },

    in: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "register": () => {
                const ioRegisterValue = assembler.ioRegisters.getValueByIndex(first.registerValue);
                assembler.cpuRegisters.update("A", ioRegisterValue);

                ioInteractions(first.registerValue);
            },

            "memory.register": () => {
                const ioRegisterValue = assembler.ioRegisters.getValueByIndex(first.memoryPoint);
                assembler.cpuRegisters.update("A", ioRegisterValue);

                ioInteractions(first.memoryPoint);
            },

            "memory.number.*": () => {
                const ioRegisterValue = assembler.ioRegisters.getValueByIndex(first.memoryPoint);
                assembler.cpuRegisters.update("A", ioRegisterValue);

                ioInteractions(first.memoryPoint);
            },

            "number.*": () => {
                const ioRegisterValue = assembler.ioRegisters.getValueByIndex(first.value);
                assembler.cpuRegisters.update("A", ioRegisterValue);

                ioInteractions(first.value);
            }
        });

        function ioInteractions(register) {
            switch(register) {
                // KBDDATA
                case 6:
                    assembler.ioRegisters.update("KBDSTATUS", 0, { force: true });
                    break;
                // RNDGEN
                case 10:
                    const randomNumber = Math.floor(Math.random() * 0x10000); // Getting a random number from [0x0000, 0xFFFF].

                    assembler.cpuRegisters.update("A", randomNumber);
                    assembler.ioRegisters.update("RNDGEN", randomNumber, { force: true });
                    break;
            }
        }
    },

    out: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);
        const registerAValue = assembler.cpuRegisters.getValue("A");

        Decoder.run(executable, {
            "register": () => {
                const ioRegister = assembler.ioRegisters.get(first.registerValue);
                assembler.ioRegisters.update(ioRegister, registerAValue);

                ioInteractions(first.registerValue);
            },

            "memory.register": () => {
                const ioRegister = assembler.ioRegisters.get(first.memoryPoint);
                assembler.ioRegisters.update(ioRegister, registerAValue);

                ioInteractions(first.memoryPoint);
            },

            "memory.number.*": () => {
                const ioRegister = assembler.ioRegisters.get(first.memoryPoint);
                assembler.ioRegisters.update(ioRegister, registerAValue);

                ioInteractions(first.memoryPoint);
            },

            "number.*": () => {
                const ioRegister = assembler.ioRegisters.get(first.value);
                assembler.ioRegisters.update(ioRegister, registerAValue);

                ioInteractions(first.value);
            }
        });

        function ioInteractions(register) {
            const registerValue = assembler.ioRegisters.getValueByIndex(register);
            
            switch(register) {
                // IRQEOI
                case 2:
                    assembler.ioRegisters.update("IRQSTATUS", assembler.ioRegisters.getValue("IRQSTATUS") & ~assembler.ioRegisters.getValue("IRQEOI"), { force: true });
                    break;
                // TMRPRELOAD
                case 3:
                    assembler.isTimerActive = true;
                    assembler.ioRegisters.update("TMRCOUNTER", assembler.ioRegisters.getValue("TMRPRELOAD"), { force: true });
                    break;
                // VIDMODE
                case 7:
                    // Why do we do this? In order to be able to send proper message to the UI thread and tell that "Assembly Reality" title should be enabled/disabled from the canvas.
                    if(registerValue > 0) self.postMessage({ action: "graphicsEnabled" });
                    else self.postMessage({ action: "graphicsDisabled" });
                    
                    break;
                // VIDADDR
                case 8:
                    const vidDataForAddress = assembler.graphics.matrix.point(registerValue);
                    assembler.ioRegisters.update("VIDDATA", vidDataForAddress);

                    break;
                // VIDDATA
                case 9:
                    const vidMode = assembler.ioRegisters.getValue("VIDMODE");
                    if(vidMode > 1) assembler.ioRegisters.update("VIDDATA", registerValue & 0xFF); // In case we're in bitmap mode, we need to ignore upper 8 bits.

                    assembler.graphics.draw(assembler, registerValue);
                    break;
            }
        }
    },

    interrupt: (assembler, executable) => {
        if(executable.instruction === "CLI") assembler.cpuRegisters.update("SR", assembler.cpuRegisters.getValue("SR") & 0b01111);
        if(executable.instruction === "STI") assembler.cpuRegisters.update("SR", assembler.cpuRegisters.getValue("SR") | 0b10000);
    
        if(executable.instruction === "IRET") {
            // 1. The return address (IP) and the status register are restored from the stack in this order.
            const IP = Stack.pop(assembler);
            const SR = Stack.pop(assembler);

            // 2. Jump to the return address.
            assembler.cpuRegisters.update("IP", IP);
            assembler.cpuRegisters.update("SR", SR); // Here we restore the old (pre-interrupt) SR.
        }
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

    if(value > assembler.cpuRegisters.getValue("SP")) assembler.ram.stackStart = value;
}