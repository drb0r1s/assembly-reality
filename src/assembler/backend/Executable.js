import { Decoder } from "./Decoder";
import { HexCalculator } from "./HexCalculator";
import { Stack } from "../structures/Stack";

export class Executable {
    constructor(assembler) {
        this.assembler = assembler;
        this.decoder = new Decoder(assembler.cpuRegisters, assembler.ram);
        this.hexCalculator = new HexCalculator(assembler.cpuRegisters);
        this.stack = new Stack(assembler.cpuRegisters, assembler.ram);
    }

    halt() {
        this.assembler.isHalted = true;
        // 0b00001 only because H flag is the last one in the SR sequence.
        this.assembler.cpuRegisters.update("SR", this.assembler.cpuRegisters.getValue("SR") | 0b00001);
    }

    move(executable, args) {
        const { first, second } = this.decoder.decode(executable, args);

        const [isHalf] = isInstructionHalf(executable.instruction);
        const registerType = isHalf ? "half.register" : "register";

        // In case of updating the stack pointer register, we need to adjust the memory.stackStart address.
        if(first?.register === "SP") this.updateStackStart(executable, second);
        
        this.decoder.run(executable, {
            [`${registerType} ${registerType}`]: () => this.assembler.cpuRegisters.update(first.register, second.registerValue),
            [`${registerType} memory.register`]: () => this.assembler.cpuRegisters.update(first.register, second.memoryPoint),
            [`${registerType} memory.number.*`]: () => this.assembler.cpuRegisters.update(first.register, second.memoryPoint),
            [`memory.register ${registerType}`]: () => this.assembler.ram.matrix.update(first.registerValue, second.registerValue, { isHalf }),
            [`memory.number.* ${registerType}`]: () => this.assembler.ram.matrix.update(first.value, second.registerValue, { isHalf }),
            [`${registerType} number.*`]: () => this.assembler.cpuRegisters.update(first.register, second.value),
            "memory.register number.*": () => this.assembler.ram.matrix.update(first.registerValue, second.value, { isHalf }),
            "memory.number.* number.*": () => this.assembler.ram.matrix.update(first.value, second.value, { isHalf })
        });
    }

    bitwise(executable, args) {
        const { first, second } = this.decoder.decode(executable, args);
        
        // The only purpose we need "instruction" here is that we can get the name of the instruction without the "B" at the end, so that we can call HexCalculator (if the instruction is half).
        const [isHalf, instruction] = isInstructionHalf(executable.instruction);

        // The only purpose of usedRegister is to detect the use of instruction which are implemented only on register A, and to return register ("A" or "AL") and its value in that case.
        const usedRegister = this.getUsedRegister(executable.instruction, isHalf, first.register);
        const registerType = isHalf ? "half.register" : "register";

        this.decoder.run(executable, {
            // ONE OPERAND
            [registerType]: () => {
                const operation = this.hexCalculator[instruction](first.registerValue, usedRegister.registerValue, { isHalf });
                this.assembler.cpuRegisters.update(usedRegister.register, operation);
            },

            "memory.register": () => {
                const operation = this.hexCalculator[instruction](first.memoryPoint, usedRegister.registerValue, { isHalf });
                this.assembler.cpuRegisters.update(usedRegister.register, operation);
            },

            "memory.number.*": () => {
                const operation = this.hexCalculator[instruction](first.memoryPoint, usedRegister.registerValue, { isHalf });
                this.assembler.cpuRegisters.update(usedRegister.register, operation);
            },

            "number.*": () => {
                const operation = this.hexCalculator[instruction](first.value, usedRegister.registerValue, { isHalf });
                this.assembler.cpuRegisters.update(usedRegister.register, operation);
            },
            
            // TWO OPERANDS
            [`${registerType} ${registerType}`]: () => {
                const operation = this.hexCalculator[instruction](first.registerValue, second.registerValue, { isHalf });
                this.assembler.cpuRegisters.update(first.register, operation);
            },
        
            [`${registerType} memory.register`]: () => {
                const operation = this.hexCalculator[instruction](first.registerValue, second.memoryPoint, { isHalf });
                this.assembler.cpuRegisters.update(first.register, operation);
            },
        
            [`${registerType} memory.number.*`]: () => {
                const operation = this.hexCalculator[instruction](first.registerValue, second.memoryPoint, { isHalf });
                this.assembler.cpuRegisters.update(first.register, operation);
            },
        
            [`${registerType} number.*`]: () => {
                const operation = this.hexCalculator[instruction](first.registerValue, second.value, { isHalf });
                this.assembler.cpuRegisters.update(first.register, operation);
            }
        });
    }

    compare(executable, args) {
        const { first, second } = this.decoder.decode(executable, args);
    
        const [isHalf] = isInstructionHalf(executable.instruction);
        const registerType = isHalf ? "half.register" : "register";

        this.decoder.run(executable, {
            [`${registerType} ${registerType}`]: () => this.hexCalculator.CMP(first.registerValue, second.registerValue),
            [`${registerType} memory.register`]: () => this.hexCalculator.CMP(first.registerValue, second.memoryPoint),
            [`${registerType} memory.number.*`]: () => this.hexCalculator.CMP(first.registerValue, second.memoryPoint),
            [`${registerType} number.*`]: () => this.hexCalculator.CMP(first.registerValue, second.value)
        });
    }

    jump(executable, args) {
        const { first } = this.decoder.decode(executable, args);
        const SR = this.assembler.cpuRegisters.constructSR();

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

        this.decoder.run(executable, {
            "memory.register": () => {
                this.assembler.cpuRegisters.update("IP", first.memoryPoint);
            },

            "number.*": () => {
                this.assembler.cpuRegisters.update("IP", first.value);
            }
        });
    }

    push(executable, args) {
        const { first } = this.decoder.decode(executable, args);

        const [isHalf] = isInstructionHalf(executable.instruction);
        const registerType = isHalf ? "half.register" : "register";

        this.decoder.run(executable, {
            [registerType]: () => this.stack.push(first.registerValue, { isHalf }),
            "number.*": () => this.stack.push(first.value, { isHalf })
        });
    }

    pop(executable, args) {
        const { first } = this.decoder.decode(executable, args);

        const [isHalf] = isInstructionHalf(executable.instruction);
        const registerType = isHalf ? "half.register" : "register";

        this.decoder.run(executable, {
            [registerType]: () => this.stack.pop(first.register, { isHalf })
        });
    }

    call(executable, args) {
        const { first } = this.decoder.decode(executable, args);

        this.decoder.run(executable, {
            "memory.register": () => {
                // IMPORTANT: Here we set the current (return) address as the next address that should be executed, after the RET instruction.
                // If we didn't specify that we want to return to the next address, we would ran into an infinite loop, as function would keep calling itself.
                const currentAddress = this.assembler.cpuRegisters.getValue("IP") + 3;

                this.assembler.cpuRegisters.update("IP", first.memoryPoint);

                this.stack.push(currentAddress); // PUSH return address to the stack.
            },

            "number.*": () => {
                // IMPORTANT: Here we set the current (return) address as the next address that should be executed, after the RET instruction.
                // If we didn't specify that we want to return to the next address, we would ran into an infinite loop, as function would keep calling itself.
                const currentAddress = this.assembler.cpuRegisters.getValue("IP") + 3;

                this.assembler.cpuRegisters.update("IP", first.value);

                this.stack.push(currentAddress); // PUSH return address to the stack.
            }
        });
    }

    ret() {
        // POP the return address from the stack.
        this.assembler.cpuRegisters.update("SP", this.assembler.cpuRegisters.getValue("SP") + 2);
        
        const popped = this.assembler.ram.matrix.point(this.assembler.cpuRegisters.getValue("SP"), { isStack: true });
        this.assembler.cpuRegisters.update("IP", popped);
    }

    in(executable, args) {
        const { first } = this.decoder.decode(executable, args);

        const ioInteractions = register => {
            switch(register) {
                // KBDDATA
                case 6:
                    this.assembler.ioRegisters.update("KBDSTATUS", 0, { force: true });
                    break;
                // RNDGEN
                case 10:
                    const randomNumber = Math.floor(Math.random() * 0x10000); // Getting a random number from [0x0000, 0xFFFF].

                    this.assembler.cpuRegisters.update("A", randomNumber);
                    this.assembler.ioRegisters.update("RNDGEN", randomNumber, { force: true });
                    break;
            }
        }

        this.decoder.run(executable, {
            "register": () => {
                const ioRegisterValue = this.assembler.ioRegisters.getValueByIndex(first.registerValue);
                this.assembler.cpuRegisters.update("A", ioRegisterValue);

                ioInteractions(first.registerValue);
            },

            "memory.register": () => {
                const ioRegisterValue = this.assembler.ioRegisters.getValueByIndex(first.memoryPoint);
                this.assembler.cpuRegisters.update("A", ioRegisterValue);

                ioInteractions(first.memoryPoint);
            },

            "memory.number.*": () => {
                const ioRegisterValue = this.assembler.ioRegisters.getValueByIndex(first.memoryPoint);
                this.assembler.cpuRegisters.update("A", ioRegisterValue);

                ioInteractions(first.memoryPoint);
            },

            "number.*": () => {
                const ioRegisterValue = this.assembler.ioRegisters.getValueByIndex(first.value);
                this.assembler.cpuRegisters.update("A", ioRegisterValue);

                ioInteractions(first.value);
            }
        });
    }

    out(executable, args) {
        const { first } = this.decoder.decode(executable, args);
        
        const registerAValue = this.assembler.cpuRegisters.getValue("A");
        const prevVidMode = this.assembler.ioRegisters.getValue("VIDMODE"); // Needed for modes switching.

        const ioInteractions = register => {
            const registerValue = this.assembler.ioRegisters.getValueByIndex(register);
            
            switch(register) {
                // IRQEOI
                case 2:
                    this.assembler.ioRegisters.update("IRQSTATUS", this.assembler.ioRegisters.getValue("IRQSTATUS") & ~this.assembler.ioRegisters.getValue("IRQEOI"), { force: true });
                    break;
                // TMRPRELOAD
                case 3:
                    this.assembler.isTimerActive = true;
                    this.assembler.ioRegisters.update("TMRCOUNTER", this.assembler.ioRegisters.getValue("TMRPRELOAD"), { force: true });
                    break;
                // VIDMODE
                case 7:
                    switch(registerValue) {
                        // DISABLED
                        case 0:
                            this.assembler.graphics.reset();
                            self.postMessage({ action: "graphicsDisabled" });

                            break;
                        // TEXT (1) or BITMAP (2)
                        case 1:
                        case 2:
                            this.assembler.graphics.startVsyncInterval();
                            self.postMessage({ action: "graphicsEnabled", data: registerValue });
                            break;
                        // CLEAR
                        case 3:
                            this.assembler.ioRegisters.update("VIDMODE", prevVidMode);
                            this.assembler.graphics.clear();

                            self.postMessage({ action: "graphicsRedraw", data: "clear" });

                            break;
                        // RESET
                        case 4:
                            this.assembler.ioRegisters.update("VIDMODE", 0);
                            this.assembler.graphics.reset();

                            self.postMessage({ action: "graphicsDisabled" });

                            break;
                    }
                    
                    break;
                // VIDADDR
                case 8:
                    const vidDataForAddress = this.assembler.graphics.matrix.point(registerValue);
                    this.assembler.ioRegisters.update("VIDDATA", vidDataForAddress);

                    break;
                // VIDDATA
                case 9:
                    const vidMode = this.assembler.ioRegisters.getValue("VIDMODE");
                    if(vidMode > 1) this.assembler.ioRegisters.update("VIDDATA", registerValue & 0xFF); // In case we're in bitmap mode, we need to ignore upper 8 bits.

                    this.assembler.graphics.update(registerValue);
                    break;
            }
        }

        this.decoder.run(executable, {
            "register": () => {
                const ioRegister = this.assembler.ioRegisters.get(first.registerValue);
                this.assembler.ioRegisters.update(ioRegister, registerAValue);

                ioInteractions(first.registerValue);
            },

            "memory.register": () => {
                const ioRegister = this.assembler.ioRegisters.get(first.memoryPoint);
                this.assembler.ioRegisters.update(ioRegister, registerAValue);

                ioInteractions(first.memoryPoint);
            },

            "memory.number.*": () => {
                const ioRegister = this.assembler.ioRegisters.get(first.memoryPoint);
                this.assembler.ioRegisters.update(ioRegister, registerAValue);

                ioInteractions(first.memoryPoint);
            },

            "number.*": () => {
                const ioRegister = this.assembler.ioRegisters.get(first.value);
                this.assembler.ioRegisters.update(ioRegister, registerAValue);

                ioInteractions(first.value);
            }
        });
    }

    interrupt(executable) {
        if(executable.instruction === "CLI") this.assembler.cpuRegisters.update("SR", this.assembler.cpuRegisters.getValue("SR") & 0b01111);
        if(executable.instruction === "STI") this.assembler.cpuRegisters.update("SR", this.assembler.cpuRegisters.getValue("SR") | 0b10000);
    
        if(executable.instruction === "IRET") {
            // 1. The return address (IP) and the status register are restored from the stack in this order.
            const IP = this.stack.pop();
            const SR = this.stack.pop();

            // 2. Jump to the return address.
            this.assembler.cpuRegisters.update("IP", IP);
            this.assembler.cpuRegisters.update("SR", SR); // Here we restore the old (pre-interrupt) SR.
        }
    }

    // INTERNAL
    updateStackStart(executable, second) {
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

        if(value > this.assembler.cpuRegisters.getValue("SP")) this.assembler.ram.stackStart = value;
    }

    getUsedRegister(instruction, isHalf, register) {
        const usedRegister = { register: null, registerValue: null };
        
        const registerAInstructions = ["MUL", "MULB", "DIV", "DIVB"];

        if(registerAInstructions.indexOf(instruction) > -1) {
            if(isHalf) usedRegister.register = "AL";
            else usedRegister.register = "A";
        }

        else usedRegister.register = register;

        usedRegister.registerValue = this.assembler.cpuRegisters.getValue(usedRegister.register);

        return usedRegister;
    }
}

function isInstructionHalf(instruction) {
    const exceptions = ["SUB", "JB", "JNB"];
    if(exceptions.indexOf(instruction) > -1) return [false, instruction];

    const last = instruction.slice(-1);
    if(last === "B") return [true, instruction.slice(0, -1)];

    return [false, instruction];
}