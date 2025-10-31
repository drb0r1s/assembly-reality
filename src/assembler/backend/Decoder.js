import { AssemblerError } from "../AssemblerError";

export const Decoder = {
    decode: (assembler, executable, args) => {
        argumentsCheck(executable, args);
        
        let decoded = { first: {}, second: {} };
        const types = executable.type.split(" ");

        let freeArgs = 0;

        for(let i = 0; i < types.length; i++) {
            const prop = i === 0 ? "first" : "second";
            decoded[prop] = { value: divideArgs(types[i]) };

            switch(types[i]) {
                case "register":
                case "half.register":
                    decoded[prop] = {
                        ...decoded[prop],
                        register: assembler.registers.get(decoded[prop].value),
                        registerValue: assembler.registers.getValueByIndex(decoded[prop].value)
                    };

                    break;
                case "memory.register":
                    const registerValue = assembler.registers.getValueByIndex(decoded[prop].value);

                    decoded[prop] = {
                        ...decoded[prop],
                        register: assembler.registers.get(decoded[prop].value),
                        registerValue,
                        memoryPoint: assembler.memory.point(registerValue)
                    };

                    break;
                case "memory.number.*":
                    decoded[prop] = {
                        ...decoded[prop],
                        memoryPoint: assembler.memory.point(decoded[prop].value)
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
                "number.*": isInstructionHalf(executable.instruction) ? 1 : 2
            };
        
            // Since type can only be of length 1 or 2, we can simplify the args assignment, there is no need for for loop.
            let code = "";

            if(lengths[type] === 1) {
                code += args[freeArgs];
                freeArgs++;
            }

            else {
                code += args[freeArgs] + args[freeArgs + 1];
                freeArgs += 2;
            }

            return code;
        }
    },

    run: (executable, runnables) => {
        const runnable = runnables[executable.type];

        if(!runnable) throw new AssemblerError("UnknownExecutableType", { type: executable.type, instruction: executable.instruction });
        runnable();
    }
};

function argumentsCheck(executable, args) {
    if(args.length !== executable.length - 1) throw new AssemblerError("InvalidNumberOfArguments", {
        instruction: executable.instruction,
        required: executable.length - 1,
        received: args.length
    });
}

function isInstructionHalf(instruction) {
    if(instruction === "SUB") return false; // This is the edge case, the only instruction ending with "B" that should not be considered half.

    const last = instruction.slice(-1);
    if(last === "B") return true;

    return false;
}