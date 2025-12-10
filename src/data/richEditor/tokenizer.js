import { keywordsRegex, middleKeywordsRegex } from "./keywords";
import { defaultRegistersRegex, memoryDefaultRegistersRegex, halfRegistersRegex, memoryHalfRegistersRegex } from "./registers";

export const tokenizer = {
    root: [
        // Keywords
        
        [keywordsRegex, "keyword"],
        [middleKeywordsRegex, "keyword"],

        // Registers

        // Default registers
        [defaultRegistersRegex, "register"],
        [memoryDefaultRegistersRegex, "memoryRegister"], // Memory default registers

        // Half registers
        [halfRegistersRegex, "halfRegister"],
        [memoryHalfRegistersRegex, "memoryHalfRegister"], // Memory half registers

        // Numbers
        [/\s([0-9]+)(?=\s|,|$)/, "number"], // Decimal
        [/\s\[([0-9]+)\](?=\s|,|$)/, "memoryNumber"], // Memory decimal
        [/\s(0x[0-9A-Fa-f]+)(?=\s|,|$)/, "number"], // Hexadecimal
        [/\s\[(0x[0-9A-Fa-f]+)\](?=\s|,|$)/, "memoryNumber"], // Memory hexadecimal
        
        // Labels
        [/^[a-zA-Z0-9_]+(?=:)/, "definitionLabel"], // Definition label
        [/\s([a-zA-Z0-9_]+)(?=\s|,|$)/, "referenceLabel"], // Reference label
        [/\s\[([a-zA-Z0-9_]+)\](?=\s|,|$)/, "memoryReferenceLabel"], // Memory reference label
        
        // Strings
        [/\"([^"\\]|\\.)*\"/, "stringDouble"], // Double-quoted strings
        [/\'([^'\\]|\\.)*\'/, "stringSingle"], // Single-quoted strings
        
        // Comments
        [/\/\*/, { token: "comment", next: "@comment" }], // Multi-line comment
        [/\/\/.*$|;.*$/, "comment"] // Comment
    ],

    // Here we need to move * character to the end of the array, so that * isn't confused for */.
    comment: [
        [/[^\*]+/, "comment"], // Match anything except *.
        [/\*\//, { token: "comment", next: "@pop" }],  // End of multi-line comment.
        [/\*/, "comment"]                 // A single * character.
    ]
};