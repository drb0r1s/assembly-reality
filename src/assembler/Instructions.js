import { AssemblerError } from "./Assembler";
import { InstructionSet } from "./InstructionSet";
import { registerIndexes } from "./registerIndexes";

export const Instructions = {
    MOV: instruction => {
        const operands = instruction.operands.filter(operand => operand.type !== "Separator");
        if(operands.length !== 2) throw new AssemblerError("InvalidOperands", `Instruction ${instruction.name} requires 2 operands!`);

        const instructionCode = InstructionSet[instruction.name](operands);
        if(!instructionCode) throw new AssemblerError("UnknownInstruction", `${instruction.name} is an unknown instruction!`);

        if(instruction.operands[1].type !== "Separator") throw new AssemblerError("MissingSeparator", `The separator is missing for the ${instruction.name} instruction!`);

        const dest = operands[0];
        const src = operands[1];

        const destCode = parseType(dest);
        const srcCode = parseType(src);

        return instructionCode + destCode + srcCode;

        function parseType(operand) {
            switch(operand.valueType) {
                case "register": return registerIndexes[operand.value];
                case "memory.register": return "00" + registerIndexes[operand.value];
                case "memory.number.hex": return operand.value.toUpperCase().padStart(4, "0");
                case "number.decimal": return parseInt(operand.value).toString(16).toUpperCase().padStart(4, "0");
                case "number.hex": return operand.value.toUpperCase().padStart(4, "0");
            }
        }
    }
};