import { keywordsRegex, middleKeywordsRegex, labelKeywordsRegex, middleLabelKeywordsRegex } from "./keywords";
import { registersRegex, memoryRegistersRegex } from "./registers";

export const tokenizer = {
    root: [
        // Keywords

        // Using keywords that are followed by a label (e.g. JMP label)
        [labelKeywordsRegex, { token: "keyword", next: "@label" }], 
        [middleLabelKeywordsRegex, { token: "keyword", next: "@label" }],
        
        [keywordsRegex, "keyword"],
        [middleKeywordsRegex, "keyword"],

        // Registers
        [registersRegex, "register"],

        // Memory registers
        [memoryRegistersRegex, "memoryRegister"],

        // Numbers
        [/\s([0-9]+)(?=\s|,|$)/, "number"], // Decimal
        [/\s(0x[0-9A-Fa-f]+)(?=\s|,|$)/, "number"], // Hexadecimal
        [/\s\[(0x[0-9A-Fa-f]+)\](?=\s|,|$)/, "memoryNumber"], // Memory hexadecimal
        
        // Labels
        [/^[a-zA-Z0-9_]+(?=:)/, "label"],
        [/\s\[([a-zA-Z0-9_]+)\](?=\s|,|$)/, "memoryLabel"], // Memory label
        
        // Strings
        [/\"([^"\\]|\\.)*\"/, "string"], // Double-quoted strings
        [/\'([^'\\]|\\.)*\'/, "string"], // Single-quoted strings
        
        // Comments
        [/\/\*/, { token: "comment", next: "@comment" }], // Multi-line comment
        [/\/\/.*$|;.*$/, "comment"] // Comment
    ],

    label: [
        [/([a-zA-Z0-9_]*)(?=(\s+$)|$)/, "label", "@pop"]
    ],

    // Here we need to move * character to the end of the array, so that * isn't confused for */.
    comment: [
        [/[^\*]+/, "comment"], // Match anything except *.
        [/\*\//, { token: "comment", next: "@pop" }],  // End of multi-line comment.
        [/\*/, "comment"]                 // A single * character.
    ]
};