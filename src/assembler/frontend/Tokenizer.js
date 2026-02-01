import { AssemblerError } from "../AssemblerError";
import { Keywords } from "./Keywords";
import { Registers } from "./Registers";

export const Tokenizer = {
    // Patterns are ordered from the highest to the lowest priority.
    patterns: {
        comment: /\/\/.*$|;.*$/g,
        "string.double": /(?<=\")([^"\\]|\\.)*(?=\")/g,
        "string.single": /(?<=\')([^'\\]|\\.)*(?=\')/g,
        "memory.number.hex": /(?<=(\s|,)\[0[xX])([0-9A-Fa-f]+)(?=\](\s|,|;|\/\/|$))/g,
        "memory.number.octal": /(?<=(\s|,)\[0[oO])([0-7]+)(?=\](\s|,|;|\/\/|$))/g,
        "memory.number.binary": /(?<=(\s|,)\[)([01]+)(?=[bB]\](\s|,|;|\/\/|$))/g,
        "memory.number.decimal": /(?<=(\s|,)\[)([0-9]+)(?=\](\s|,|;|\/\/|$))/g,
        "memory.half.register": new RegExp(`(?<=(\\s|,)\\[)(${Registers.expression.half.root})(?=\\](\\s|,|;|\\/\\/|$))`, "g"),
        "memory.register": new RegExp(`(?<=(\\s|,)\\[)(${Registers.expression.default.root})(?=\\](\\s|,|;|\\/\\/|$))`, "g"),
        "memory.label.reference": /(?<=(\s|,)\[)([a-zA-Z0-9_]+)(?=\](\s|,|;|\/\/|$))/g,
        keyword: new RegExp(`(?<=^|\\s)${Keywords.expression.root}`, "g"),
        "half.register": new RegExp(`(?<=(\\s|,))(${Registers.expression.half.root})(?=\\s|,|;|\\/\\/|$)`, "g"),
        register: new RegExp(`(?<=(\\s|,))(${Registers.expression.default.root})(?=\\s|,|;|\\/\\/|$)`, "g"),
        "number.hex": /(?<=(\s|,)0[xX])([0-9A-Fa-f]+)(?=\s|,|;|\/\/|$)/g,
        "number.octal": /(?<=(\s|,)0[oO])([0-7]+)(?=\s|,|;|\/\/|$)/g,
        "number.binary": /(?<=(\s|,))([01]+)(?=[bB](\s|,|;|\/\/|$))/g,
        "number.decimal": /(?<=(\s|,))([0-9]+)(?=\s|,|;|\/\/|$)/g,
        "label.definition": /(?<=(^\s*))[a-zA-Z0-9_]+(?=:)/g,
        "label.reference": /(?<=(\s|,))([a-zA-Z0-9_]+)(?=(\s|,|;|\/\/|$))/g,
        symbol: /[,:\(\)]/g,
    },

    priorities: [
        "comment",
        "string.double",
        "string.single",
        "memory.number.hex",
        "memory.number.octal",
        "memory.number.binary",
        "memory.number.decimal",
        "memory.half.register",
        "memory.register",
        "memory.label.reference",
        "keyword",
        "half.register",
        "register",
        "number.hex",
        "number.octal",
        "number.binary",
        "number.decimal",
        "label.definition",
        "label.reference",
        "symbol"
    ],
    
    tokenize: text => {
        const tokens = [];

        // \r may exist at the end of the line, because of Monaco editor
        const lines = text.split(/\r?\n/);

        for(let i = 0; i < lines.length; i++) {
            if(lines[i].length === 0) continue;
            
            const lineTokens = []; // This variable will store all matched tokens from the specific line.
            const taken = Array(lines[i].length).fill(false);

            for(let j = 0; j < Tokenizer.priorities.length; j++) {
                const type = Tokenizer.priorities[j];
                const pattern = Tokenizer.patterns[type];
                
                pattern.lastIndex = 0; // We need to restart the pointer, because it is no longer relevant for the new matches.

                let match;
                
                // Here, we are using .exec() instead of .matchAll(), because it can process one match at a time, making it more memory-efficient.
                // .exec() returns only one match per pattern, it also leaves .lastIndex pointer, so it can continue scanning from where it left (the last match).
                while((match = pattern.exec(lines[i])) !== null) {
                    const start = match.index;
                    const end = match.index + match[0].length;

                    if(taken.slice(start, end).some(Boolean)) continue;
                    for(let k = start; k < end; k++) taken[k] = true;

                    const token = {
                        type,
                        value: match[0],
                        line: i + 1,
                        start,
                        end
                    };

                    if(token.type === "keyword") token.isHalf = Tokenizer.isKeywordHalf(token.value);

                    // All tokens of type "string.single" are going to be transformed to "number.decimal".
                    if(token.type === "string.single") {
                        if(token.value.length > 1) throw new AssemblerError("StringAsACharacter", null, token.line);

                        token.type = "number.decimal";
                        token.value = token.value.charCodeAt(0);
                    }
                    
                    lineTokens.push(token);
                }
            }

            // Because tokens in lineTokens are added based on the order of Tokenizer.patterns, we need to sort them based on their starting position, in order to get the correct order of tokens.
            lineTokens.sort((a, b) => a.start - b.start);
            tokens.push(...lineTokens);
        }

        return tokens;
    },

    isKeywordHalf: keyword => {
        const exceptions = ["SUB", "JB", "JNB"];
        if(exceptions.indexOf(keyword) > -1) return false;

        const last = keyword.slice(-1);
        if(last === "B") return true;

        return false;
    }
};