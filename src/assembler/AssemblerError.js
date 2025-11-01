export class AssemblerError {
    constructor(type, attributes, line) {
        this.type = type;
        this.line = line ? line : null;
        this.isRuntime = false;
        this.content = this.getContent(attributes);
    }

    getContent(attributes) {
        switch(this.type) {
            case "UnknownInstruction": return `${attributes.name} is an unknown instruction!`;
            case "UnknownInstructionCode":
                this.isRuntime = true;
                return `${attributes.code} doesn't represent any instruction!`;
            case "UnknownExecutableType":
                this.isRuntime = true;
                return `"${attributes.type}" is not valid for executable ${attributes.instruction}!`;
            case "InvalidOperandsCombination": return `Combination of ${attributes.operands[0]} and ${attributes.operands[1]} operands is invalid for the ${attributes.instruction} instruction!`;
            case "InvalidOperand": return `Operand ${attributes.operand} is invalid for the ${attributes.instruction} instruction!`;
            case "InvalidNumberOfOperands": return `Instruction ${attributes.name} requires ${attributes.operands} operand${attributes.operands !== 1 ? "s" : ""}!`;
            case "InvalidNumberOfArguments":
                this.isRuntime = true;
                return `Instruction ${attributes.instruction} requires ${attributes.required} argument${attributes.required !== 1 ? "s" : ""}, but received ${attributes.received}!`;
            case "MissingSeparator": return `The separator is missing for the ${attributes.name} instruction!`;
            case "DecimalLimit16": return "16-bit operand must have a value between 0 and 65535!";
            case "DecimalLimit8": return "8-bit operand must have a value between 0 and 255!";
            case "DecimalMemoryLimit": return "Decimal memory pointer operand must have a value between 0 and 4127!";
            case "HexLimit16": return "16-bit operand must have a value between 0x0000 and 0xFFFF!";
            case "HexLimit8": return "8-bit operand must have a value between 0x00 and 0xFF!";
            case "HexMemoryLimit": return "Hex memory pointer operand must have a value between 0x0000 and 0x101F!";
            case "OutOfMemory": return "Memory limit exceeded!";
            case "DivisionByZero":
                this.isRuntime = true;
                return "DIV instruction cannot be performed with operand 0!";
        }
    }
};