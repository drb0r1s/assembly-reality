import { AssemblerError } from "../AssemblerError";
import { Registers } from "../Registers";

export const Encoder = {
    oneOperand: (instruction, combinations) => {
        if(instruction.operands.length !== 1) throw new AssemblerError("InvalidNumberOfOperands", { name: instruction.name, operands: 1 }, instruction.line);

        const instructionCode = getInstructionCode(instruction, instruction.operands, combinations);
        
        const dest = instruction.operands[0];
        const destCode = parseType(instruction, dest);

        return instructionCode + destCode;
    },
    
    twoOperands: (instruction, combinations) => {
        const operands = instruction.operands.filter(operand => operand.type !== "Separator");
        if(operands.length !== 2) throw new AssemblerError("InvalidNumberOfOperands", { name: instruction.name, operands: 2 }, instruction.line);

        const instructionCode = getInstructionCode(instruction, operands, combinations);

        if(instruction.operands[1].type !== "Separator") throw new AssemblerError("MissingSeparator", { name: instruction.name }, instruction.line);

        const dest = operands[0];
        const src = operands[1];

        const destCode = parseType(instruction, dest);
        const srcCode = parseType(instruction, src);

        return instructionCode + destCode + srcCode;
    }
};

function parseType(instruction, operand) {
    // isHalf is used for 8-bit instructions
    const data = {
        codeLength: instruction.isHalf ? 2 : 4,
        maxValue: instruction.isHalf ? 255 : 65535,
        maxMemoryValue: 4127,
        bits: instruction.isHalf ? 8 : 16
    };

    const registers = new Registers();
    
    switch(operand.valueType) {
        case "register": return registers.getIndex(operand.value);
        case "half.register": return registers.getIndex(operand.value);
        case "memory.register": return "00" + registers.getIndex(operand.value);
        case "memory.half.register": return registers.getIndex(operand.value);
        case "memory.number.hex":
            if(parseInt(`0x${operand.value}`) > data.maxMemoryValue) throw new AssemblerError("HexMemoryLimit", {}, instruction.line);
            return operand.value.toUpperCase().padStart(4, "0");
        case "memory.number.decimal":
            if(parseInt(operand.value) > data.maxMemoryValue) throw new AssemblerError("DecimalMemoryLimit", {}, instruction.line);
            return parseInt(operand.value).toString(16).toUpperCase().padStart(4, "0");
        case "number.hex":
            if(parseInt(`0x${operand.value}`) > data.maxValue) throw new AssemblerError(`HexLimit${data.bits}`, {}, instruction.line);
            // Here we firstly convert hexadecimal number back to decimal number, in order to escape the edge case (e.g. 0x0012), which can lead to 16-bit numbers in 8-bit instructions.
            // We use parseInt() here to get rid of starting zeros (if they exist).
            return parseInt(`0x${operand.value}`).toString(16).toUpperCase().padStart(data.codeLength, "0");
        case "number.decimal":
            if(parseInt(operand.value) > data.maxValue) throw new AssemblerError(`DecimalLimit${data.bits}`, {}, instruction.line);
            return parseInt(operand.value).toString(16).toUpperCase().padStart(data.codeLength, "0");
        default: throw new AssemblerError("InvalidOperand", { operand: operand.value, instruction: instruction.name }, instruction.line);
    }
}

function getInstructionCode(instruction, operands, combinations) {
    // ONE OPERAND
    if(operands.length === 1) {
        const [first] = operands;
        const instructionCode = combinations[generalizeType(first.valueType)];

        if(!instructionCode) throw new AssemblerError("InvalidOperand", { operand: first.value, instruction: instruction.name }, instruction.line);
        return instructionCode;
    }
    
    // TWO OPERANDS
    else {
        const [first, second] = operands;
        const valueTypes = `${generalizeType(first.valueType)} ${generalizeType(second.valueType)}`;

        return extractInstructionCode();

        function extractInstructionCode() {
            const instructionCode = combinations[valueTypes];
            
            if(!instructionCode) throw new AssemblerError("InvalidOperandsCombination", { operands: [first.value, second.value], instruction: instruction.name }, instruction.line);
            return instructionCode;
        }
    }

    // number.hex => number.*
    function generalizeType(valueType) {
        if(!valueType.startsWith("number") && !valueType.startsWith("memory.number")) return valueType; // Currently only used for number type.
            
        const parts = valueType.split(".");

        if(parts[0] === "memory") return `memory.${parts[1]}.*`;
        return `${parts[0]}.*`;
    }
}