import { Tokenizer } from "./Tokenizer";
import { AST } from "./AST";

export const Compiler = {
    assemble: text => {
        const tokens = Tokenizer.tokenize(text);
        const ast = AST.build(tokens);

        console.log(ast)
    }
};