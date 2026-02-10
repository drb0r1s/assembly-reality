import { AssemblerError } from "../AssemblerError";
import { ByteNumber } from "../helpers/ByteNumber";

const exceptions = new Set(["SUB", "JB", "JNB"]);

export class Decoder {
    constructor(cpuRegisters, ram) {
        this.cpuRegisters = cpuRegisters;
        this.ram = ram;
    }

    decode(executable, args) {
        argumentsCheck(executable, args);

        const isHalf = isInstructionHalf(executable.instruction);
        
        let decoded = { first: {}, second: {} };
        const types = executable.type.split(" ");

        let freeArgs = 0;

        for(let i = 0; i < types.length; i++) {
            const prop = i === 0 ? "first" : "second";

            const value = divideArgs(types[i]);
            decoded[prop] = { value: value.length === 1 ? value[0] : ByteNumber.join(value) };

            switch(types[i]) {
                case "register":
                case "half.register":
                    decoded[prop] = {
                        ...decoded[prop],
                        register: this.cpuRegisters.get(decoded[prop].value),
                        registerValue: this.cpuRegisters.getValueByIndex(decoded[prop].value)
                    };

                    break;
                case "memory.register":
                    const registerValue = this.cpuRegisters.getValueByIndex(decoded[prop].value);

                    decoded[prop] = {
                        ...decoded[prop],
                        register: this.cpuRegisters.get(decoded[prop].value),
                        registerValue,
                        memoryPoint: this.ram.matrix.point(registerValue, isHalf)
                    };

                    break;
                case "memory.number.*":
                    decoded[prop] = {
                        ...decoded[prop],
                        memoryPoint: this.ram.matrix.point(decoded[prop].value, isHalf)
                    };

                    break;
            }
        }

        return decoded;

        function divideArgs(type) {
            const lengths = {
                "register": 1,
                "half.register": 1,
                "memory.register": 2,
                "memory.number.*": 2,
                "number.*": isHalf ? 1 : 2
            };
        
            // Since type can only be of length 1 or 2, we can simplify the args assignment, there is no need for for loop.
            const cells = [];

            if(lengths[type] === 1) {
                cells.push(args[freeArgs]);
                freeArgs++;
            }

            else {
                cells.push(args[freeArgs], args[freeArgs + 1]);
                freeArgs += 2;
            }

            return cells;
        }
    }

    run(executable, runnables, first, second, isHalf, instruction) {
        const runnable = runnables[executable.type];

        if(!runnable) throw new AssemblerError("UnknownExecutableType", { type: executable.type, instruction: executable.instruction });
        runnable(first, second, isHalf, instruction);
    }
}

function argumentsCheck(executable, args) {
    if(args.length !== executable.length - 1) throw new AssemblerError("InvalidNumberOfArguments", {
        instruction: executable.instruction,
        required: executable.length - 1,
        received: args.length
    });
}

function isInstructionHalf(instruction) {
    if(exceptions.has(instruction)) return false;

    const last = instruction.slice(-1);
    if(last === "B") return true;

    return false;
}