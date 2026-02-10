import { Decoder } from "./Decoder";
import { HexCalculator } from "./HexCalculator";
import { Stack } from "../structures/Stack";

const registerAInstructions = new Set(["MUL", "MULB", "DIV", "DIVB"]);
const exceptions = new Set(["SUB", "JB", "JNB"]);

export class Executable {
    constructor(assembler) {
        this.assembler = assembler;
        this.decoder = new Decoder(assembler.cpuRegisters, assembler.ram);
        this.hexCalculator = new HexCalculator(assembler.cpuRegisters);
        this.stack = new Stack(assembler.cpuRegisters, assembler.ram);

        this.runnables = {
            move: this.buildMoveRunnables(),
            bitwise: this.buildBitwiseRunnables(),
            compare: this.buildCompareRunnables(),
            jump: this.buildJumpRunnables(),
            push: this.buildPushRunnables(),
            pop: this.buildPopRunnables(),
            call: this.buildCallRunnables(),
            in: this.buildInRunnables(),
            out: this.buildOutRunnables()
        };
    }

    halt() {
        this.assembler.deactivate();
    }

    buildMoveRunnables() {
        return {
            "register register": (first, second, _) => this.assembler.cpuRegisters.update(first.register, second.registerValue),
            "half.register half.register": (first, second, _) => this.assembler.cpuRegisters.update(first.register, second.registerValue),
            "register memory.register": (first, second, _) => this.assembler.cpuRegisters.update(first.register, second.memoryPoint),
            "half.register memory.register": (first, second, _) => this.assembler.cpuRegisters.update(first.register, second.memoryPoint),
            "register memory.number.*": (first, second, _) => this.assembler.cpuRegisters.update(first.register, second.memoryPoint),
            "half.register memory.number.*": (first, second, _) => this.assembler.cpuRegisters.update(first.register, second.memoryPoint),
            "memory.register register": (first, second, _) => this.assembler.ram.matrix.update(first.registerValue, second.registerValue),
            "memory.register half.register": (first, second, isHalf) => this.assembler.ram.matrix.update(first.registerValue, second.registerValue, isHalf),
            "memory.number.* register": (first, second, _) => this.assembler.ram.matrix.update(first.value, second.registerValue),
            "memory.number.* half.register": (first, second, isHalf) => this.assembler.ram.matrix.update(first.value, second.registerValue, isHalf),
            "register number.*": (first, second, _) => this.assembler.cpuRegisters.update(first.register, second.value),
            "half.register number.*": (first, second, _) => this.assembler.cpuRegisters.update(first.register, second.value),
            "memory.register number.*": (first, second, isHalf) => this.assembler.ram.matrix.update(first.registerValue, second.value, isHalf),
            "memory.number.* number.*": (first, second, isHalf) => this.assembler.ram.matrix.update(first.value, second.value, isHalf)
        };
    }

    move(executable, args) {
        const { first, second } = this.decoder.decode(executable, args);
        const [isHalf] = isInstructionHalf(executable.instruction);

        // In case of updating the stack pointer register, we need to adjust the memory.stackStart address.
        if(first?.register === "SP") this.updateStackStart(executable, second);
        
        this.decoder.run(executable, this.runnables.move, first, second, isHalf);
    }

    buildBitwiseRunnables() {
        return {
            // ONE OPERAND
            "register": (first, second, _, instruction) => {
                const operation = this.hexCalculator[instruction](first.registerValue, second.registerValue);
                this.assembler.cpuRegisters.update(second.register, operation);
            },

            "half.register": (first, second, isHalf, instruction) => {
                const operation = this.hexCalculator[instruction](first.registerValue, second.registerValue, isHalf);
                this.assembler.cpuRegisters.update(second.register, operation);
            },

            "memory.register": (first, second, isHalf, instruction) => {
                const operation = this.hexCalculator[instruction](first.memoryPoint, second.registerValue, isHalf);
                this.assembler.cpuRegisters.update(second.register, operation);
            },

            "memory.number.*": (first, second, isHalf, instruction) => {
                const operation = this.hexCalculator[instruction](first.memoryPoint, second.registerValue, isHalf);
                this.assembler.cpuRegisters.update(second.register, operation);
            },

            "number.*": (first, second, isHalf, instruction) => {
                const operation = this.hexCalculator[instruction](first.value, second.registerValue, isHalf);
                this.assembler.cpuRegisters.update(second.register, operation);
            },
            
            // TWO OPERANDS
            "register register": (first, second, _, instruction) => {
                const operation = this.hexCalculator[instruction](first.registerValue, second.registerValue);
                this.assembler.cpuRegisters.update(first.register, operation);
            },

            "half.register half.register": (first, second, isHalf, instruction) => {
                const operation = this.hexCalculator[instruction](first.registerValue, second.registerValue, isHalf);
                this.assembler.cpuRegisters.update(first.register, operation);
            },

            "register memory.register": (first, second, isHalf, instruction) => {
                const operation = this.hexCalculator[instruction](first.registerValue, second.memoryPoint, isHalf);
                this.assembler.cpuRegisters.update(first.register, operation);
            },

            "half.register memory.register": (first, second, isHalf, instruction) => {
                const operation = this.hexCalculator[instruction](first.registerValue, second.memoryPoint, isHalf);
                this.assembler.cpuRegisters.update(first.register, operation);
            },
        
            "register memory.number.*": (first, second, isHalf, instruction) => {
                const operation = this.hexCalculator[instruction](first.registerValue, second.memoryPoint, isHalf);
                this.assembler.cpuRegisters.update(first.register, operation);
            },

            "half.register memory.number.*": (first, second, isHalf, instruction) => {
                const operation = this.hexCalculator[instruction](first.registerValue, second.memoryPoint, isHalf);
                this.assembler.cpuRegisters.update(first.register, operation);
            },

            "register number.*": (first, second, isHalf, instruction) => {
                const operation = this.hexCalculator[instruction](first.registerValue, second.value, isHalf);
                this.assembler.cpuRegisters.update(first.register, operation);
            },

            "half.register number.*": (first, second, isHalf, instruction) => {
                const operation = this.hexCalculator[instruction](first.registerValue, second.value, isHalf);
                this.assembler.cpuRegisters.update(first.register, operation);
            },
        };
    }

    bitwise(executable, args) {
        const { first, second } = this.decoder.decode(executable, args);
        
        // The only purpose we need "instruction" here is that we can get the name of the instruction without the "B" at the end, so that we can call HexCalculator (if the instruction is half).
        const [isHalf, instruction] = isInstructionHalf(executable.instruction);

        // The only purpose of usedRegister is to detect the use of instruction which are implemented only on register A, and to return register ("A" or "AL") and its value in that case.
        const usedRegister = this.getUsedRegister(executable.instruction, isHalf, first.register);

        this.decoder.run(executable, this.runnables.bitwise, first, (executable.operands === 2 ? second : usedRegister), isHalf, instruction);
    }

    buildCompareRunnables() {
        return {
            "register register": (first, second) => this.hexCalculator.CMP(first.registerValue, second.registerValue),
            "half.register half.register": (first, second) => this.hexCalculator.CMP(first.registerValue, second.registerValue),
            "register memory.register": (first, second) => this.hexCalculator.CMP(first.registerValue, second.memoryPoint),
            "half.register memory.register": (first, second) => this.hexCalculator.CMP(first.registerValue, second.memoryPoint),
            "register memory.number.*": (first, second) => this.hexCalculator.CMP(first.registerValue, second.memoryPoint),
            "half.register memory.number.*": (first, second) => this.hexCalculator.CMP(first.registerValue, second.memoryPoint),
            "register number.*": (first, second) => this.hexCalculator.CMP(first.registerValue, second.value),
            "half.register number.*": (first, second) => this.hexCalculator.CMP(first.registerValue, second.value)
        };
    }

    compare(executable, args) {
        const { first, second } = this.decoder.decode(executable, args);
        this.decoder.run(executable, this.runnables.compare, first, second);
    }

    buildJumpRunnables() {
        return {
            "memory.register": first => {
                this.assembler.cpuRegisters.update("IP", first.memoryPoint);
            },

            "number.*": first => {
                this.assembler.cpuRegisters.update("IP", first.value);
            }
        };
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

        this.decoder.run(executable, this.runnables.jump, first);
    }

    buildPushRunnables() {
        return {
            "register": (first, _) => this.stack.push(first.registerValue),
            "half.register": (first, isHalf) => this.stack.push(first.registerValue, isHalf),
            "number.*": (first, isHalf) => this.stack.push(first.value, isHalf)
        };
    }

    push(executable, args) {
        const { first } = this.decoder.decode(executable, args);
        const [isHalf] = isInstructionHalf(executable.instruction);

        this.decoder.run(executable, this.runnables.push, first, isHalf);
    }

    buildPopRunnables() {
        return {
            "register": first => this.stack.pop(first.register),
            "half.register": first => this.stack.pop(first.register, true),
        };
    }

    pop(executable, args) {
        const { first } = this.decoder.decode(executable, args);
        this.decoder.run(executable, this.runnables.pop, first);
    }

    buildCallRunnables() {
        return {
            "memory.register": first => {
                // IMPORTANT: Here we set the current (return) address as the next address that should be executed, after the RET instruction.
                // If we didn't specify that we want to return to the next address, we would ran into an infinite loop, as function would keep calling itself.
                const currentAddress = this.assembler.cpuRegisters.getValue("IP") + 3;

                this.assembler.cpuRegisters.update("IP", first.memoryPoint);

                this.stack.push(currentAddress); // PUSH return address to the stack.
            },

            "number.*": first => {
                // IMPORTANT: Here we set the current (return) address as the next address that should be executed, after the RET instruction.
                // If we didn't specify that we want to return to the next address, we would ran into an infinite loop, as function would keep calling itself.
                const currentAddress = this.assembler.cpuRegisters.getValue("IP") + 3;

                this.assembler.cpuRegisters.update("IP", first.value);

                this.stack.push(currentAddress); // PUSH return address to the stack.
            }
        };
    }

    call(executable, args) {
        const { first } = this.decoder.decode(executable, args);
        this.decoder.run(executable, this.runnables.call, first);
    }

    ret() {
        // POP the return address from the stack.
        this.assembler.cpuRegisters.update("SP", this.assembler.cpuRegisters.getValue("SP") + 2);
        
        const popped = this.assembler.ram.matrix.point(this.assembler.cpuRegisters.getValue("SP"), false, true);
        this.assembler.cpuRegisters.update("IP", popped);
    }

    buildInRunnables() {
        return {
            "register": (first, ioInteractions) => {
                const ioRegisterValue = this.assembler.ioRegisters.getValueByIndex(first.registerValue);
                this.assembler.cpuRegisters.update("A", ioRegisterValue);

                ioInteractions(first.registerValue);
            },

            "memory.register": (first, ioInteractions) => {
                const ioRegisterValue = this.assembler.ioRegisters.getValueByIndex(first.memoryPoint);
                this.assembler.cpuRegisters.update("A", ioRegisterValue);

                ioInteractions(first.memoryPoint);
            },

            "memory.number.*": (first, ioInteractions) => {
                const ioRegisterValue = this.assembler.ioRegisters.getValueByIndex(first.memoryPoint);
                this.assembler.cpuRegisters.update("A", ioRegisterValue);

                ioInteractions(first.memoryPoint);
            },

            "number.*": (first, ioInteractions) => {
                const ioRegisterValue = this.assembler.ioRegisters.getValueByIndex(first.value);
                this.assembler.cpuRegisters.update("A", ioRegisterValue);

                ioInteractions(first.value);
            }
        };
    }

    in(executable, args) {
        const { first } = this.decoder.decode(executable, args);

        const ioInteractions = register => {
            switch(register) {
                // KBDDATA
                case 6:
                    this.assembler.ioRegisters.update("KBDSTATUS", 0, true);
                    break;
                // RNDGEN
                case 10:
                    const randomNumber = Math.floor(Math.random() * 0x10000); // Getting a random number from [0x0000, 0xFFFF].

                    this.assembler.cpuRegisters.update("A", randomNumber);
                    this.assembler.ioRegisters.update("RNDGEN", randomNumber, true);
                    break;
            }
        }

        this.decoder.run(executable, this.runnables.in, first, ioInteractions);
    }

    buildOutRunnables() {
        return {
            "register": (first, registerAValue, ioInteractions) => {
                const ioRegister = this.assembler.ioRegisters.get(first.registerValue);
                this.assembler.ioRegisters.update(ioRegister, registerAValue);

                ioInteractions(first.registerValue);
            },

            "memory.register": (first, registerAValue, ioInteractions) => {
                const ioRegister = this.assembler.ioRegisters.get(first.memoryPoint);
                this.assembler.ioRegisters.update(ioRegister, registerAValue);

                ioInteractions(first.memoryPoint);
            },

            "memory.number.*": (first, registerAValue, ioInteractions) => {
                const ioRegister = this.assembler.ioRegisters.get(first.memoryPoint);
                this.assembler.ioRegisters.update(ioRegister, registerAValue);

                ioInteractions(first.memoryPoint);
            },

            "number.*": (first, registerAValue, ioInteractions) => {
                const ioRegister = this.assembler.ioRegisters.get(first.value);
                this.assembler.ioRegisters.update(ioRegister, registerAValue);

                ioInteractions(first.value);
            }
        };
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
                    this.assembler.ioRegisters.update("IRQSTATUS", this.assembler.ioRegisters.getValue("IRQSTATUS") & ~this.assembler.ioRegisters.getValue("IRQEOI"), true);
                    break;
                // TMRPRELOAD
                case 3:
                    this.assembler.ioRegisters.update("TMRCOUNTER", this.assembler.ioRegisters.getValue("TMRPRELOAD"), true);
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
                            if(prevVidMode > 0 && prevVidMode === registerValue) return;
                            self.postMessage({ action: "graphicsEnabled", data: registerValue });
                            break;
                        // CLEAR
                        case 3:
                            this.assembler.ioRegisters.update("VIDMODE", prevVidMode);
                            this.assembler.graphics.clear(prevVidMode);

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

        this.decoder.run(executable, this.runnables.out, first, registerAValue, ioInteractions);
    }

    interrupt(executable) {
        if(executable.instruction === "CLI") this.assembler.cpuRegisters.updateSR({ M: 0 });
        
        if(executable.instruction === "STI") {
            this.assembler.cpuRegisters.updateSR({ M: 1 });
        }
    
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

        if(registerAInstructions.has(instruction)) {
            if(isHalf) usedRegister.register = "AL";
            else usedRegister.register = "A";
        }

        else usedRegister.register = register;

        usedRegister.registerValue = this.assembler.cpuRegisters.getValue(usedRegister.register);

        return usedRegister;
    }
}

function isInstructionHalf(instruction) {
    if(exceptions.has(instruction)) return [false, instruction];

    const last = instruction.slice(-1);
    if(last === "B") return [true, instruction.slice(0, -1)];

    return [false, instruction];
}