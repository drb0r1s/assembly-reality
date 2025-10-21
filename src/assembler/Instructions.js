import { AssemblerError } from "./Assembler";
import { InstructionSet } from "./InstructionSet";
import { registerIndexes } from "./registerIndexes";

export const Instructions = {
    MOV: instruction => {
        const operands = instruction.operands.filter(operand => operand.type !== "Separator");
        if(operands.length !== 2) throw new AssemblerError("InvalidOperands", { name: instruction.name, operands: 2 });

        const instructionCode = InstructionSet[instruction.name](operands);

        if(instruction.operands[1].type !== "Separator") throw new AssemblerError("MissingSeparator", { name: instruction.name });

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
                case "number.decimal":
                    if(operand.value > 65535) throw new AssemblerError("DecimalLimit16");
                    return parseInt(operand.value).toString(16).toUpperCase().padStart(4, "0");
                case "number.hex": return operand.value.toUpperCase().padStart(4, "0");
                default: throw new AssemblerError("InvalidOperand", { operand: operand.value, instruction: instruction.name });
            }
        }
    },

    MOVB: instruction => {
        const operands = instruction.operands.filter(operand => operand.type !== "Separator");
        if(operands.length !== 2) throw new AssemblerError("InvalidOperands", { name: instruction.name, operands: 2 });

        const instructionCode = InstructionSet[instruction.name](operands);

        if(instruction.operands[1].type !== "Separator") throw new AssemblerError("MissingSeparator", { name: instruction.name });

        const dest = operands[0];
        const src = operands[1];

        const destCode = parseType(dest);
        const srcCode = parseType(src);

        return instructionCode + destCode + srcCode;

        function parseType(operand) {
            switch(operand.valueType) {
                case "half.register": return registerIndexes[operand.value];
                case "memory.half.register": return registerIndexes[operand.value];
                case "memory.number.hex": return operand.value.toUpperCase().padStart(2, "0");
                case "number.decimal":
                    if(operand.value > 255) throw new AssemblerError("DecimalLimit8");
                    return parseInt(operand.value).toString(16).toUpperCase().padStart(2, "0");
                case "number.hex": return operand.value.toUpperCase().padStart(2, "0");
                default: throw new AssemblerError("InvalidOperand", { operand: operand.value, instruction: instruction.name });
            }
        }
    }
};