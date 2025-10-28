import { AssemblerError } from "./AssemblerError";

export const Executor = {
    codes: {
        // MOV
        "01": { instruction: "MOV", type: "register register", length: 3 },
        "02": { instruction: "MOV", type: "register memory.register", length: 4 },
        "03": { instruction: "MOV", type: "register memory.number.*", length: 4 },
        "04": { instruction: "MOV", type: "memory.register register", length: 4 },
        "05": { instruction: "MOV", type: "memory.number.* register", length: 4 },
        "06": { instruction: "MOV", type: "register number.*", length: 4 },
        "07": { instruction: "MOV", type: "memory.register number.*", length: 5 },
        "08": { instruction: "MOV", type: "memory.number.* number.*", length: 5 },

        // MOVB
        "09": { instruction: "MOVB", type: "half.register half.register", length: 3 },
        "0A": { instruction: "MOVB", type: "half.register memory.register", length: 4 },
        "0B": { instruction: "MOVB", type: "half.register memory.number.*", length: 4 },
        "0C": { instruction: "MOVB", type: "memory.register half.register", length: 4 },
        "0D": { instruction: "MOVB", type: "memory.number.* half.register", length: 4 },
        "0E": { instruction: "MOVB", type: "half.register number.*", length: 3 },
        "0F": { instruction: "MOVB", type: "memory.register number.*", length: 4 },
        "10": { instruction: "MOVB", type: "memory.number.* number.*", length: 4 },
    },

    MOV: (assembler, executable, args) => {
        argumentsCheck(executable, args);

        let first = null;
        let second = null;

        switch(executable.type) {
            case "register register":
                first = assembler.registers.get(args[0]);
                second = assembler.registers.getValueByIndex(args[1]);

                assembler.registers.update(first, second);

                break;
            case "register memory.register":
                first = assembler.registers.get(args[0]);
                
                const registerValue = assembler.registers.getValueByIndex(args[1]);
                second = assembler.memory.point(registerValue);

                assembler.registers.update(first, second);

                break;
            case "register memory.number.*":
                first = assembler.registers.get(args[0]);
                second = assembler.memory.point(args[1] + args[2]);

                assembler.registers.update(first, second);

                break;
            case "memory.register register":
                first = assembler.registers.getValueByIndex(args[1]);
                second = assembler.registers.getValueByIndex(args[2]);

                assembler.memory.rewrite(first, second);

                break;
            case "memory.number.* register":
                first = args[0] + args[1];
                second = assembler.registers.getValueByIndex(args[2]);

                assembler.memory.rewrite(first, second);

                break;
            case "register number.*":
                first = assembler.registers.get(args[0]);
                second = args[1] + args[2];

                assembler.registers.update(first, second);

                break;
            case "memory.register number.*":
                first = assembler.registers.getValueByIndex(args[1]);
                second = args[2] + args[3];

                assembler.memory.rewrite(first, second);

                break;
            case "memory.number.* number.*":
                first = args[0] + args[1];
                second = args[2] + args[3];

                assembler.memory.rewrite(first, second);

                break;
            default: throw new AssemblerError("UnknownExecutableType", { type: executable.type, instruction: executable.instruction });
        }
    },

    MOVB: (assembler, executable, args) => {
        argumentsCheck(executable, args);

        let first = null;
        let second = null;

        switch(executable.type) {
            case "half.register half.register":
                first = assembler.registers.get(args[0]);
                second = assembler.registers.getValueByIndex(args[1]);

                assembler.registers.update(first, second);

                break;
            case "half.register memory.register":
                first = assembler.registers.get(args[0]);
                
                const registerValue = assembler.registers.getValueByIndex(args[2]);
                second = assembler.memory.point(registerValue);

                assembler.registers.update(first, second);

                break;
            case "half.register memory.number.*":
                first = assembler.registers.get(args[0]);
                second = assembler.memory.point(args[1] + args[2]);

                assembler.registers.update(first, second);

                break;
            case "memory.register half.register":
                first = assembler.registers.getValueByIndex(args[1]);
                second = assembler.registers.getValueByIndex(args[2]);

                assembler.memory.rewrite(first, second);

                break;
            case "memory.number.* half.register":
                first = args[0] + args[1];
                second = assembler.registers.getValueByIndex(args[2]);

                assembler.memory.rewrite(first, second);

                break;
            case "half.register number.*":
                first = assembler.registers.get(args[0]);
                second = args[1];

                assembler.registers.update(first, second);

                break;
            case "memory.register number.*":
                first = assembler.registers.getValueByIndex(args[1]);
                second = args[2];

                assembler.memory.rewrite(first, second);

                break;
            case "memory.number.* number.*":
                first = args[0] + args[1];
                second = args[2];

                assembler.memory.rewrite(first, second);

                break;
            default: throw new AssemblerError("UnknownExecutableType", { type: executable.type, instruction: executable.instruction });
        }
    }
};

function argumentsCheck(executable, args) {
    if(args.length !== executable.length - 1) throw new AssemblerError("InvalidNumberOfArguments", {
        instruction: executable.instruction,
        required: executable.length - 1,
        received: args.length
    });
}