import { keywordsRegex } from "../data/richEditor/keywords";
import { rootRegistersExpression } from "../data/richEditor/registers";

export const Tokenizer = {
    // Patterns are ordered from the highest to the lowest priority.
    patterns: {
        comment: /\/\/.*$|;.*$/g,
        "string.double": /\"([^"\\]|\\.)*\"/g,
        "string.single": /\'([^'\\]|\\.)*\'/g,
        "memory.number.hex": /(?<=\s\[)(0x[0-9A-Fa-f]+)(?=\](\s|,|$))/g,
        "memory.register": new RegExp(`(?<=\\[)(${rootRegistersExpression})(?=\\](\\s|,|$))`, "g"),
        "memory.label": /(?<=\s\[)([a-zA-Z0-9_]+)(?=\](\s|,|$))/g,
        keyword: new RegExp(keywordsRegex.source, "g"),
        register: new RegExp(`(?<=\\s)(${rootRegistersExpression})(?=\\s|,|$)`, "g"),
        label: /^[a-zA-Z0-9_]+(?=:)/g,
        "number.hex": /(?<=\s)(0x[0-9A-Fa-f]+)(?=\s|,|$)/g,
        "number.decimal": /(?<=\s)([0-9]+)(?=\s|,|$)/g,
        symbol: /[,:\(\)]/g,
    },

    priorities: [
        "comment",
        "string.double",
        "string.single",
        "memory.number.hex",
        "memory.register",
        "memory.label",
        "keyword",
        "register",
        "label",
        "number.hex",
        "number.decimal",
        "symbol"
    ],
    
    tokenize: text => {
        const tokens = [];

        // \r may exist at the end of the line, because of Monaco editor
        const lines = text.split(/\r?\n/).filter(line => line.length > 0);

        for(let i = 0; i < lines.length; i++) {
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
                    
                    lineTokens.push({
                        type,
                        value: match[0],
                        line: i,
                        start,
                        end
                    });
                }
            }

            // Because tokens in lineTokens are added based on the order of Tokenizer.patterns, we need to sort them based on their starting position, in order to get the correct order of tokens.
            lineTokens.sort((a, b) => a.start - b.start);
            tokens.push(...lineTokens);
        }

        return tokens;
    }
};