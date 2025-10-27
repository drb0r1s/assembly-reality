import { AssemblerError } from "./Assembler";
import { Registers } from "./Registers";
import { Manager } from "../Manager";

export const Executor = {
    codes: {
        "06": { instruction: "MOV", type: "register register", length: 4 }
    },

    MOV: (assembler, executable, args) => {
        if(args.length !== executable.length - 1) throw new AssemblerError("InvalidNumberOfArguments", {
            instruction: executable.instruction,
            required: executable.length - 1,
            received: args.length
        });

        const register = Registers.getRegister(args[0]);
        const value = args[1] + args[2];

        assembler.registers = {...assembler.registers, [register]: value};
        Manager.trigger("registerUpdate", assembler.registers);
    }
};