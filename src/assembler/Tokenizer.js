import { keywordsRegex } from "../data/richEditor/keywords";
import { rootRegistersExpression } from "../data/richEditor/registers";

export const Tokenizer = {
    patterns: {
        keyword: new RegExp(keywordsRegex.source, "g"),
        register: new RegExp(`(?<=\\s)(${rootRegistersExpression})(?=\\s|,|$)`, "g"),
        label: /^[a-zA-Z0-9_]+(?=:)/g,
        symbol: /[,:\(\)]/g,
        "memory.label": /(?<=\s\[)([a-zA-Z0-9_]+)(?=\](\s|,|$))/g,
        "memory.register": new RegExp(`(?<=\\[)(${rootRegistersExpression})(?=\\](\\s|,|$))`, "g"),
        "number.decimal": /(?<=\s)([0-9]+)(?=\s|,|$)/g,
        "number.hex": /(?<=\s)(0x[0-9A-Fa-f]+)(?=\s|,|$)/g,
        "memory.number.hex": /(?<=\s\[)(0x[0-9A-Fa-f]+)(?=\](\s|,|$))/g,
        "string.doubleQuoted": /\"([^"\\]|\\.)*\"/g,
        "string.singleQuoted": /\'([^'\\]|\\.)*\'/g,
        comment: /\/\/.*$|;.*$/g
    },
    
    tokenize: text => {
        const tokens = [];

        // \r may exist at the end of the line, because of Monaco editor
        const lines = text.split(/\r?\n/).filter(line => line.length > 0);

        for(let i = 0; i < lines.length; i++) {
            const lineTokens = []; // This variable will store all matched tokens from the specific line.

            for(const [type, pattern] of Object.entries(Tokenizer.patterns)) {
                pattern.lastIndex = 0; // We need to restart the pointer, because it is no longer relevant for the new matches.

                let match;
                
                // Here, we are using .exec() instead of .matchAll(), because it can process one match at a time, making it more memory-efficient.
                // .exec() returns only one match per pattern, it also leaves .lastIndex pointer, so it can continue scanning from where it left (the last match).
                while((match = pattern.exec(lines[i])) !== null) lineTokens.push({
                    type,
                    value: match[0],
                    line: i,
                    start: match.index,
                    end: match.index + match[0].length
                });
            }

            // Because tokens in lineTokens are added based on the order of Tokenizer.patterns, we need to sort them based on their starting position, in order to get the correct order of tokens.
            lineTokens.sort((a, b) => a.start - b.start);
            tokens.push(...lineTokens);
        }

        return tokens;
    }
};