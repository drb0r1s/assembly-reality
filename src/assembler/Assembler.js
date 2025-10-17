import { Tokenizer } from "./Tokenizer";
import { AST } from "./AST";

export const Assembler = {
    assemble: text => {
        const tokens = Tokenizer.tokenize(text);
        const ast = AST.build(tokens);

        const memoryMapMatrix = Array.from({ length: 258 }, () => Array.from({ length: 16 }, () => "00"));

        for(let i = 0; i < ast.instructions.length; i++) {
            Assembler.assembleInstruction(ast.instructions[i]);
        }

        return memoryMapMatrix;
    },

    assembleInstruction: instruction => {

    }
};