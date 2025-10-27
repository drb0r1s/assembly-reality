import { Tokenizer } from "./Tokenizer";
import { AST } from "./AST";
import { Instructions } from "./Instructions";
import { Memory } from "./Memory";
import { Executor } from "./Executor";

export class Assembler {
    constructor() {
        this.memory = new Memory();
        this.halted = false; // End the assembling of the code.
        this.registers = {
            A: "0000", B: "0000", C: "0000", D: "0000",
            IP: "0000", SP: "0000",
            SR: { M: "0", C: "0", Z: "0", F: "0", H: "0" }
        };
    }
    
    assemble(text) {
        const tokens = Tokenizer.tokenize(text);
        const ast = AST.build(tokens);
        console.log(ast)

        if(this.memory.free.i !== 0 || this.memory.free.j !== 0) this.memory.reset(); // We need to clean the memory before assembling the code.

        for(let i = 0; i < ast.instructions.length; i++) {
            try {
                this.assembleInstruction(ast.instructions[i]);
            }

            catch(error) {
                if(error instanceof AssemblerError) return { error };
                else console.error(error);
            }
        }

        return this.memory.matrix;
    }

    assembleInstruction(instruction) {
        let assembledCode = "";
        const instructionMethod = Instructions[instruction.name];

        if(instructionMethod) assembledCode = instructionMethod(instruction);
        else throw new AssemblerError("UnknownInstruction", { name: instruction.name }, instruction.line);

        if(assembledCode) this.memory.write(assembledCode);
    }

    execute() {
        while(true) {
            if(this.memory.execution.i === this.memory.free.i && this.memory.execution.j === this.memory.free.j) break;

            const cell = this.memory.matrix[this.memory.execution.i][this.memory.execution.j];
            
            try {
                this.executeInstruction(cell);
            }

            catch(error) {
                if(error instanceof AssemblerError) return { error };
                else console.error(error);
            }

            // For infinite loop prevention, in case of bugs.
            if(this.memory.execution.i > this.memory.matrix.length) break;
        }
    }

    executeInstruction(cell) {
        const executable = Executor.codes[cell];
        if(!executable) throw new AssemblerError("UnknownInstructionCode", { code: cell });

        const start = { i: this.memory.execution.i, j: this.memory.execution.j };

        this.memory.execution.j += executable.length;

        if(this.memory.execution.j > 15) {
            this.memory.execution.i++;
            this.memory.execution.j -= 16;
        }

        const args = this.collectArgs(start);
        Executor[executable.instruction](this, executable, args);
    }

    collectArgs(start) {
        const args = [];
        const positions = {...start};

        while(true) {
            if(positions.i === this.memory.execution.i && positions.j === this.memory.execution.j) break;

            args.push(this.memory.matrix[positions.i][positions.j]);

            if(positions.j === 15) {
                positions.i++;
                positions.j = 0;
            }

            else positions.j++;

            // For infinite loop prevention, in case of bugs.
            if(positions.i > this.memory.matrix.length) break;
        }

        args.shift(); // We want to remove the first argument, because it is the instruction code, which is already known.
        return args;
    }

    reset() {
        this.memory.reset();
        this.halted = false;

        this.registers = {
            A: "0000", B: "0000", C: "0000", D: "0000",
            IP: "0000", SP: "0000",
            SR: { M: "0", C: "0", Z: "0", F: "0", H: "0" }
        };
    }
};

export class AssemblerError {
    constructor(type, attributes, line) {
        this.type = type;
        this.content = this.getContent(attributes);
        this.line = line ? line : null;
    }

    getContent(attributes) {
        switch(this.type) {
            case "UnknownInstruction": return `${attributes.name} is an unknown instruction!`;
            case "UnknownInstructionCode": return `${attributes.code} doesn't represent any instruction!`;
            case "UnknownExecutableType": return `"${attributes.type}" is not valid for executable ${attributes.instruction}!`;
            case "InvalidOperandsCombination": return `Combination of ${attributes.operands[0]} and ${attributes.operands[1]} operands is invalid for the ${attributes.instruction} instruction!`;
            case "InvalidOperand": return `Operand ${attributes.operand} is invalid for the ${attributes.instruction} instruction!`;
            case "InvalidNumberOfOperands": return `Instruction ${attributes.name} requires ${attributes.operands} operand${attributes.operands !== 1 ? "s" : ""}!`;
            case "InvalidNumberOfArguments": return `Instruction ${attributes.instruction} requires ${attributes.required} argument${attributes.required !== 1 ? "s" : ""}, but received ${attributes.received}!`;
            case "MissingSeparator": return `The separator is missing for the ${attributes.name} instruction!`;
            case "DecimalLimit16": return "16-bit operand must have a value between 0 and 65535!";
            case "DecimalLimit8": return "8-bit operand must have a value between 0 and 255!";
            case "DecimalMemoryLimit": return "Decimal memory pointer operand must have a value between 0 and 4127!";
            case "HexLimit16": return "16-bit operand must have a value between 0x0000 and 0xFFFF!";
            case "HexLimit8": return "8-bit operand must have a value between 0x00 and 0xFF!";
            case "HexMemoryLimit": return "Hex memory pointer operand must have a value between 0x0000 and 0x101F!";
            case "OutOfMemory": return "Memory limit exceeded!";
        }
    }
};