import { AssemblerError } from "../AssemblerError";
import { CPURegisters } from "../components/CPURegisters";
import { ByteNumber } from "../helpers/ByteNumber";

export const Encoder = {
    oneOperand: (instruction, combinations) => {
        if(instruction.operands.length !== 1) throw new AssemblerError("InvalidNumberOfOperands", { name: instruction.name, operands: 1 }, instruction.line);

        const instructionCell = getInstructionCell(instruction, instruction.operands, combinations);
        
        const dest = instruction.operands[0];
        const destCell = parseType(instruction, dest);

        return [instructionCell, ...destCell];
    },
    
    twoOperands: (instruction, combinations) => {
        const operands = instruction.operands.filter(operand => operand.type !== "Separator");
        if(operands.length !== 2) throw new AssemblerError("InvalidNumberOfOperands", { name: instruction.name, operands: 2 }, instruction.line);

        const instructionCell = getInstructionCell(instruction, operands, combinations);

        if(instruction.operands[1].type !== "Separator") throw new AssemblerError("MissingSeparator", { name: instruction.name }, instruction.line);

        const dest = operands[0];
        const src = operands[1];

        const destCell = parseType(instruction, dest);
        const srcCell = parseType(instruction, src);

        return [instructionCell, ...destCell, ...srcCell];
    }
};

function parseType(instruction, operand) {
    // isHalf is used for 8-bit instructions
    const data = {
        maxValue: instruction.isHalf ? 255 : 65535,
        maxMemoryValue: 4127,
        bits: instruction.isHalf ? 8 : 16
    };

    const cpuRegisters = new CPURegisters();
    
    switch(operand.valueType) {
        case "register": return [cpuRegisters.getIndex(operand.value)];
        case "half.register": return [cpuRegisters.getIndex(operand.value)];
        case "memory.register": return [0, cpuRegisters.getIndex(operand.value)];
        case "memory.number.hex":
            const intMemoryHexValue = parseInt(operand.value, 16);
            if(intMemoryHexValue > data.maxMemoryValue) throw new AssemblerError("HexMemoryLimit", {}, instruction.line);
            
            return ByteNumber.divide(intMemoryHexValue);
        case "memory.number.octal":
            const intMemoryOctalValue = parseInt(operand.value, 8);
            if(intMemoryOctalValue > data.maxMemoryValue) throw new AssemblerError("OctalMemoryLimit", {}, instruction.line);
            
            return ByteNumber.divide(intMemoryOctalValue);
        case "memory.number.binary":
            const intMemoryBinaryValue = parseInt(operand.value, 2);
            if(intMemoryBinaryValue > data.maxMemoryValue) throw new AssemblerError("BinaryMemoryLimit", {}, instruction.line);
        
            return ByteNumber.divide(intMemoryBinaryValue);
        case "memory.number.decimal":
            const intMemoryDecimalValue = parseInt(operand.value);
            if(intMemoryDecimalValue > data.maxMemoryValue) throw new AssemblerError("DecimalMemoryLimit", {}, instruction.line);
            
            return ByteNumber.divide(intMemoryDecimalValue);
        case "number.hex":
            const intHexValue = parseInt(operand.value, 16);
            if(intHexValue > data.maxValue) throw new AssemblerError(`HexLimit${data.bits}`, {}, instruction.line);
            
            if(instruction.isHalf) return [intHexValue];
            return ByteNumber.divide(intHexValue);
        case "number.octal":
            const intOctalValue = parseInt(operand.value, 8);
            if(intOctalValue > data.maxValue) throw new AssemblerError(`OctalLimit${data.bits}`, {}, instruction.line);
            
            if(instruction.isHalf) return [intOctalValue];
            return ByteNumber.divide(intOctalValue);
        case "number.binary":
            const intBinaryValue = parseInt(operand.value, 2);
            if(intBinaryValue > data.maxValue) throw new AssemblerError(`BinaryLimit${data.bits}`, {}, instruction.line);

            if(instruction.isHalf) return [intBinaryValue];
            return ByteNumber.divide(intBinaryValue);
        case "number.decimal":
            const intDecimalValue = parseInt(operand.value);
            if(intDecimalValue > data.maxValue) throw new AssemblerError(`DecimalLimit${data.bits}`, {}, instruction.line);
            
            if(instruction.isHalf) return [intDecimalValue];
            return ByteNumber.divide(intDecimalValue);
        case "label.reference":
        case "memory.label.reference":
            return operand.value;
        default: throw new AssemblerError("InvalidOperand", { operand: operand.value, instruction: instruction.name }, instruction.line);
    }
}

function getInstructionCell(instruction, operands, combinations) {
    // ONE OPERAND
    if(operands.length === 1) {
        const [first] = operands;
        const instructionCell = combinations[generalizeType(first.valueType)];

        if(!instructionCell) throw new AssemblerError("InvalidOperand", { operand: first.value, instruction: instruction.name }, instruction.line);
        return instructionCell;
    }
    
    // TWO OPERANDS
    else {
        const [first, second] = operands;
        const valueTypes = `${generalizeType(first.valueType)} ${generalizeType(second.valueType)}`;

        return extractInstructionCell();

        function extractInstructionCell() {
            const instructionCell = combinations[valueTypes];
            
            if(!instructionCell) throw new AssemblerError("InvalidOperandsCombination", { operands: [first.value, second.value], instruction: instruction.name }, instruction.line);
            return instructionCell;
        }
    }

    // number.hex => number.*
    function generalizeType(valueType) {
        const generalization = [
            "number.decimal", "number.binary", "number.octal", "number.hex",
            "memory.number.decimal", "memory.number.binary", "memory.number.octal", "memory.number.hex",
            "label.reference", "memory.label.reference"
        ];

        if(generalization.indexOf(valueType) === -1) return valueType;
            
        const parts = valueType.split(".");

        if(parts[0] === "memory") return "memory.number.*";
        return "number.*";
    }
}