class ProgramNode {
    constructor() {
        this.type = "Program";
        this.statements = []; // Statement is either a "label.definition" or a "instruction".
    }
}

class LabelNode {
    constructor(name, line) {
        this.type = "Label";
        this.name = name;
        this.line = line;
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

class InstantNode {
    constructor(name, line, isHalf, operands) {
        this.type = "Instant";
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
    instantKeywords: ["DW", "DB"],

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
                    const statementNode = AST.parseStatement(line.tokens);
                    if(statementNode) programNode.statements.push(...statementNode);
                }

                // Reseting the line object.
                line.number = token.line;
                line.tokens = [];
            }

            line.tokens.push(token);
        }

        // When the loop finishes, parse anything that was left from the last line.
        if(line.tokens.length > 0) {
            const statementNode = AST.parseStatement(line.tokens);
            if(statementNode) programNode.statements.push(...statementNode);
        }

        return programNode;
    },

    // tokens parameter contains all the tokens from the specific line
    // The reason return value of this method is an array is because we want to support the following syntax: label: MOV A, B.
    parseStatement: tokens => {
        if(!tokens.length) return [];

        // AST should ignore comments.
        const filteredTokens = tokens.filter(token => token.type !== "comment");

        const firstToken = filteredTokens[0];
        if(!firstToken) return [];

        if(firstToken.type === "label.definition") {
            return [new LabelNode(firstToken.value, firstToken.line), ...AST.parseStatement(filteredTokens.slice(2))]; // .slice(2) because of "label.definition" and "symbol".
        }

        if(firstToken.type === "keyword") {
            let node;

            if(AST.instantKeywords.indexOf(firstToken.value) > -1) node = new InstantNode(firstToken.value, firstToken.line, firstToken.isHalf, []);
            else node = new InstructionNode(firstToken.value, firstToken.line, firstToken.isHalf, []);
            
            for(let i = 1; i < filteredTokens.length; i++) {
                node.operands.push(AST.parseOperand(filteredTokens[i]));
            }

            return [node];
        }
    },

    parseOperand: token => {
        if(token.value === ",") return new SeparatorNode(token.value);
        return new OperandNode(token.value, token.type);
    }
};