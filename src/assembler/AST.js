class ProgramNode {
    constructor() {
        this.type = "Program";
        this.instructions = [];
    }
}

class InstructionNode {
    constructor(name, line, isHalf, operands) {
        this.type = "Instruction";
        this.name = name;
        this.line = line;
        this.isHalf = isHalf;
        this.operands = operands;
    }
}

class OperandNode {
    constructor(value, type) {
        this.type = "Operand";
        this.value = value
        this.valueType = type;
    }
}

class SeparatorNode {
    constructor(value) {
        this.type = "Separator";
        this.value = value;
    }
}

export const AST = {
    build: tokens => {
        const programNode = new ProgramNode();

        // line.number contains the number of the line we're currently on
        // line.tokens holds all the tokens from that specific line
        const line = { number: tokens[0].line, tokens: [] };

        for(let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            // New line is reached, we should parse all the tokens from the previous line first.
            if(token.line !== line.number) {
                if(line.tokens.length > 0) {
                    const instructionNode = AST.parseInstruction(line.tokens);
                    programNode.instructions.push(instructionNode);
                }

                // Reseting the line object.
                line.number = token.line;
                line.tokens = [];
            }

            line.tokens.push(token);
        }

        // When the loop finishes, parse anything that was left from the last line.
        if(line.tokens.length > 0) {
            const instructionNode = AST.parseInstruction(line.tokens);
            programNode.instructions.push(instructionNode);
        }

        return programNode;
    },

    // tokens parameter contains all the tokens from the specific line
    parseInstruction: tokens => {
        const firstToken = tokens[0];

        if(firstToken.type === "keyword") {
            const instructionNode = new InstructionNode(firstToken.value, firstToken.line, firstToken.isHalf, []);
            
            for(let i = 1; i < tokens.length; i++) {
                if(tokens[i].type === "comment") continue; // AST ignores the comments.
                instructionNode.operands.push(AST.parseOperand(tokens[i]));
            }

            return instructionNode;
        }
    },

    parseOperand: token => {
        if(token.value === ",") return new SeparatorNode(token.value);
        return new OperandNode(token.value, token.type);
    }
};