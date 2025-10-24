import { keywordsRegex, middleKeywordsRegex, jumpKeywordsRegex, middleJumpKeywordsRegex } from "./keywords";
import { defaultRegistersRegex, memoryDefaultRegistersRegex, halfRegistersRegex, memoryHalfRegistersRegex } from "./registers";

export const tokenizer = {
    root: [
        // Keywords

        // Using jump keywords that are followed by a memory register, memory number, or a label (e.g. JMP label).
        [jumpKeywordsRegex, { token: "keyword", next: "@jump" }], 
        [middleJumpKeywordsRegex, { token: "keyword", next: "@jump" }],
        
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
        [/^[a-zA-Z0-9_]+(?=:)/, "label"],
        [/\s\[([a-zA-Z0-9_]+)\](?=\s|,|$)/, "memoryLabel"], // Memory label
        
        // Strings
        [/\"([^"\\]|\\.)*\"/, "string"], // Double-quoted strings
        [/\'([^'\\]|\\.)*\'/, "string"], // Single-quoted strings
        
        // Comments
        [/\/\*/, { token: "comment", next: "@comment" }], // Multi-line comment
        [/\/\/.*$|;.*$/, "comment"] // Comment
    ],

    jump: [
        // Registers
        [memoryDefaultRegistersRegex, "memoryRegister", "@pop"], // Memory default registers
        [memoryHalfRegistersRegex, "memoryHalfRegister", "@pop"], // Memory half registers

        // Numbers
        [/\s\[([0-9]+)\](?=\s|,|$)/, "memoryNumber", "@pop"], // Memory decimal
        [/\s\[(0x[0-9A-Fa-f]+)\](?=\s|,|$)/, "memoryNumber", "@pop"], // Memory hexadecimal

        // Labels
        [/([a-zA-Z0-9_]*)(?=(\s+$)|$)/, "label", "@pop"]
    ],

    // Here we need to move * character to the end of the array, so that * isn't confused for */.
    comment: [
        [/[^\*]+/, "comment"], // Match anything except *.
        [/\*\//, { token: "comment", next: "@pop" }],  // End of multi-line comment.
        [/\*/, "comment"]                 // A single * character.
    ]
};