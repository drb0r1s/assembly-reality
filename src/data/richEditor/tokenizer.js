import { keywordsRegex, variableKeywordsRegex } from "./keywords";
import { registersRegex } from "./registers";

export const tokenizer = {
    root: [
        // Keywords
        [variableKeywordsRegex, { token: "keyword", next: "@variable" }], // Using keywords that are followed by a variable (e.g. JMP variable)
        [keywordsRegex, "keyword"],
        
        // Variables
        [/^[a-zA-Z0-9_]+(?=:)/, "variable"], // Default variables
        [/\[[a-zA-Z0-9_]+\]/, "variable"], // Calling variables
        
        // Registers
        [registersRegex, "register"],
        
        // Numbers
        [/\s([0-9]+)(?=\s|,|$)/, "number"], // Decimal
        [/\s(0x[0-9A-Fa-f]+)(?=\s|,|$)/, "number"], // Hexadecimal
        
        // Strings
        [/\"([^"\\]|\\.)*\"/, "string"], // Double-quoted strings
        [/\'([^'\\]|\\.)*\'/, "string"], // Single-quoted strings
        
        // Comments
        [/\/\*/, { token: "comment", next: "@comment" }], // Multi-line comment
        [/\/\/.*$|;.*$/, "comment"] // Comment
    ],

    variable: [
        [/([a-zA-Z0-9_]*)(?=(\s+$)|$)/, "variable", "@pop"]
    ],

    // Here we need to move * character to the end of the array, so that * isn't confused for */.
    comment: [
        [/[^\*]+/, "comment"], // Match anything except *.
        [/\*\//, { token: "comment", next: "@pop" }],  // End of multi-line comment.
        [/\*/, "comment"]                 // A single * character.
    ]
};