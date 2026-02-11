export class AssemblerError {
    constructor(type, attributes, line, cpuRegisters) {
        this.type = type;
        this.line = line ? line : null;
        this.isRuntime = false;
        this.cpuRegisters = cpuRegisters;
        this.content = this.getContent(attributes);
    }

    getContent(attributes) {
        switch(this.type) {
            case "SyntaxError": return "The code you're trying to assemble has a syntax error!";
            case "UnknownExecutionError": return "An unknown error has occurred during the execution!";
            case "UnknownRefreshError": return "An unknown error has occurred during the I/O refresh!";
            case "UnknownInstruction": return `${attributes.name} is an unknown instruction!`;
            case "UnknownInstant": return `${attributes.name} is an unknown instant instruction!`;
            case "UnknownInstructionCode":
                this.runtime();
                return `${attributes.code.toString(16).toUpperCase().padStart(2, "0")} doesn't represent any instruction!`;
            case "UnknownExecutableType":
                this.runtime();
                return `"${attributes.type}" is not valid for executable ${attributes.instruction}!`;
            case "UnknownLabel": return `"${attributes.label}" label is not defined.`;
            case "DuplicatedLabel": return `"${attributes.label}" label was defined more than once.`;
            case "InvalidOperandsCombination": return `Combination of ${attributes.operands[0]} and ${attributes.operands[1]} operands is invalid for the ${attributes.instruction} instruction!`;
            case "InvalidOperand": return `Operand ${attributes.operand} is invalid for the ${attributes.instruction} instruction!`;
            case "InvalidOperandInInstant": return `Operand ${attributes.operand} is invalid for the ${attributes.instant} instant!`;
            case "InvalidNumberOfOperands": return `Instruction ${attributes.name} requires ${attributes.operands} operand${attributes.operands !== 1 ? "s" : ""}!`;
            case "InvalidNumberOfArguments":
                this.runtime();
                return `Instruction ${attributes.instruction} requires ${attributes.required} argument${attributes.required !== 1 ? "s" : ""}, but received ${attributes.received}!`;
            case "MissingSeparator": return `The separator is missing for the ${attributes.name} instruction!`;
            case "DecimalLimit16": return "16-bit operand must have a value between 0 and 65535!";
            case "DecimalLimit8": return "8-bit operand must have a value between 0 and 255!";
            case "DecimalMemoryLimit": return "Decimal memory pointer operand must have a value between 0 and 4127!";
            case "BinaryLimit16": return "16-bit operand must have a value between 0b and 1111111111111111b!";
            case "BinaryLimit8": return "8-bit operand must have a value between 0b and 11111111b!";
            case "BinaryMemoryLimit": return "Binary memory pointer operand must have a value between 0b and 1000000011111b!";
            case "OctalLimit16": return "16-bit operand must have a value between 0o00 and 0o177777!";
            case "OctalLimit8": return "8-bit operand must have a value between 0o0 and 0o377!";
            case "OctalMemoryLimit": return "Octal memory pointer operand must have a value between 0o00 and 0o10037!";
            case "HexLimit16": return "16-bit operand must have a value between 0x0000 and 0xFFFF!";
            case "HexLimit8": return "8-bit operand must have a value between 0x00 and 0xFF!";
            case "HexMemoryLimit": return "Hex memory pointer operand must have a value between 0x0000 and 0x101F!";
            case "StackPointerLimit":
                this.runtime();
                return "Stack pointer must have a value between 0x0000 and 0x101F!";
            case "StackUnderflow":
                this.runtime();
                return "Cannot pop from an empty stack!";
            case "ReadOnlyRegisterUpdate":
                this.runtime();
                return `${attributes.register} is a read-only register, it cannot be updated!`;
            case "OutOfMemory": return "Memory limit exceeded!";
            case "DivisionByZero":
                this.runtime();
                return "DIV instruction cannot be performed with operand 0!";
            case "StringAsACharacter": return "Single characters must be defined using 'single quotes', \"double quotes\" are reserved for strings.";
        }
    }

    runtime() {
        this.isRuntime = true;
        if(this.cpuRegisters) this.cpuRegisters.updateSR({ F: true });
    }
};