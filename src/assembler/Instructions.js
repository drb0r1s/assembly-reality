import { AssemblerError } from "./Assembler";
import { InstructionSet } from "./InstructionSet";
import { registerIndexes } from "./registerIndexes";

export const Instructions = {
    HLT: instruction => {
        const instructionCode = InstructionSet[instruction.name]();
        return instructionCode;
    },

    MOV: instruction => {
        const operands = instruction.operands.filter(operand => operand.type !== "Separator");
        if(operands.length !== 2) throw new AssemblerError("InvalidNumberOfOperands", { name: instruction.name, operands: 2 }, instruction.line);

        const instructionCode = InstructionSet[instruction.name](instruction, operands);

        if(instruction.operands[1].type !== "Separator") throw new AssemblerError("MissingSeparator", { name: instruction.name }, instruction.line);

        const dest = operands[0];
        const src = operands[1];

        const destCode = parseType(dest);
        const srcCode = parseType(src);

        return instructionCode + destCode + srcCode;

        function parseType(operand) {
            switch(operand.valueType) {
                case "register": return registerIndexes[operand.value];
                case "memory.register": return "00" + registerIndexes[operand.value];
                case "memory.half.register": return registerIndexes[operand.value];
                case "memory.number.hex": return operand.value.toUpperCase().padStart(4, "0");
                case "number.decimal":
                    if(operand.value > 65535) throw new AssemblerError("DecimalLimit16", {}, instruction.line);
                    return parseInt(operand.value).toString(16).toUpperCase().padStart(4, "0");
                case "number.hex":
                    if(parseInt(`0x${operand.value}`) > 65535) throw new AssemblerError("HexLimit16", {}, instruction.line);
                    return operand.value.toUpperCase().padStart(4, "0");
                default: throw new AssemblerError("InvalidOperand", { operand: operand.value, instruction: instruction.name }, instruction.line);
            }
        }
    },

    MOVB: instruction => {
        const operands = instruction.operands.filter(operand => operand.type !== "Separator");
        if(operands.length !== 2) throw new AssemblerError("InvalidNumberOfOperands", { name: instruction.name, operands: 2 }, instruction.line);

        const instructionCode = InstructionSet[instruction.name](instruction, operands);

        if(instruction.operands[1].type !== "Separator") throw new AssemblerError("MissingSeparator", { name: instruction.name }, instruction.line);

        const dest = operands[0];
        const src = operands[1];

        const destCode = parseType(dest);
        const srcCode = parseType(src);

        return instructionCode + destCode + srcCode;

        function parseType(operand) {
            switch(operand.valueType) {
                case "half.register": return registerIndexes[operand.value];
                case "memory.register": return "00" + registerIndexes[operand.value];
                case "memory.half.register": return registerIndexes[operand.value];
                case "memory.number.hex": return operand.value.toUpperCase().padStart(4, "0");
                case "number.decimal":
                    if(operand.value > 255) throw new AssemblerError("DecimalLimit8", {}, instruction.line);
                    return parseInt(operand.value).toString(16).toUpperCase().padStart(2, "0");
                case "number.hex":
                    if(parseInt(`0x${operand.value}`) > 255) throw new AssemblerError("HexLimit8", {}, instruction.line);
                    
                    if(operand.value.length > 2) return operand.value.substring(2).toUpperCase(); // Edge case: 0x00FF
                    return operand.value.toUpperCase().padStart(2, "0");
                default: throw new AssemblerError("InvalidOperand", { operand: operand.value, instruction: instruction.name }, instruction.line);
            }
        }
    }
};