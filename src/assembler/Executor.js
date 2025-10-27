import { AssemblerError } from "./Assembler";
import { Registers } from "./Registers";
import { Manager } from "../Manager";

export const Executor = {
    codes: {
        // MOV
        "01": { instruction: "MOV", type: "register register", length: 3 },
        "02": { instruction: "MOV", type: "register memory.register", length: 4 },
        "03": { instruction: "MOV", type: "register memory.number.*", length: 4 },
        "04": { instruction: "MOV", type: "memory.register register", length: 4 },
        "05": { instruction: "MOV", type: "memory.number.* register", length: 4 },
        "06": { instruction: "MOV", type: "register number.*", length: 4 },
        "07": { instruction: "MOV", type: "memory.register number.*", length: 4 },
        "08": { instruction: "MOV", type: "memory.number.* number.*", length: 4 },
    },

    MOV: (assembler, executable, args) => {
        if(args.length !== executable.length - 1) throw new AssemblerError("InvalidNumberOfArguments", {
            instruction: executable.instruction,
            required: executable.length - 1,
            received: args.length
        });

        let first = null;
        let second = null;

        let registerValue = null;

        switch(executable.type) {
            case "register register":
                first = Registers.getRegister(args[0]);
                second = assembler.registers[Registers.getRegister(args[1])];

                assembler.registers = {...assembler.registers, [first]: second};
                Manager.trigger("registerUpdate", assembler.registers);

                break;
            case "register memory.register":
                first = Registers.getRegister(args[0]);
                
                registerValue = assembler.registers[Registers.getRegister(args[1])];
                second = assembler.memory.point(registerValue);

                assembler.registers = {...assembler.registers, [first]: second};
                Manager.trigger("registerUpdate", assembler.registers);

                break;
            case "register memory.number.*":
                first = Registers.getRegister(args[0]);
                second = assembler.memory.point(args[1] + args[2]);

                assembler.registers = {...assembler.registers, [first]: second};
                Manager.trigger("registerUpdate", assembler.registers);

                break;
            case "memory.register register":
                first = assembler.registers[Registers.getRegister(args[0])];
                second = Registers.getRegister(args[1]);

                

                break;
            case "register number.*":
                first = Registers.getRegister(args[0]);
                second = args[1] + args[2];

                assembler.registers = {...assembler.registers, [first]: second};
                Manager.trigger("registerUpdate", assembler.registers);

                break;
        }
    }
};