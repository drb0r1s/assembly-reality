import { Keywords } from "../../assembler/frontend/Keywords";
import { Registers } from "../../assembler/frontend/Registers";

export const tokenizer = {
    root: [
        // Keywords
        
        [Keywords.expression.regex, "keyword"],
        [Keywords.expression.middleRegex, "keyword"],

        // Registers

        // Default registers
        [Registers.expression.default.regex, "register"],
        [Registers.expression.default.memory, "memoryRegister"], // Memory default registers

        // Half registers
        [Registers.expression.half.regex, "halfRegister"],
        [Registers.expression.half.memory, "memoryHalfRegister"], // Memory half registers

        // Numbers
        [/\s([0-9]+)([dD]?)(?=\s|,|$)/, "number"], // Decimal
        [/\s\[([0-9]+)([dD]?)\](?=\s|,|$)/, "memoryNumber"], // Memory decimal
        [/\s(0[xX][0-9A-Fa-f]+)(?=\s|,|$)/, "number"], // Hexadecimal
        [/\s\[(0[xX][0-9A-Fa-f]+)\](?=\s|,|$)/, "memoryNumber"], // Memory hexadecimal
        [/\s(0[oO][0-7]+)(?=\s|,|$)/, "number"], // Octal
        [/\s\[(0[oO][0-7]+)\](?=\s|,|$)/, "memoryNumber"], // Memory octal
        [/\s([01]+)[bB](?=\s|,|$)/, "number"], // Binary
        [/\s\[([01]+)[bB]\](?=\s|,|$)/, "memoryNumber"], // Memory binary
        
        // Labels
        [/^\s*[a-zA-Z0-9_]+(?=:)/, "definitionLabel"], // Definition label
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