const keywords = [
    "HLT", "MOV", "MOVB", "ADD", "ADDB", "SUB", "SUBB", "INC", "INCB", "DEC", "DECB",
    "CMP", "CMPB", "JMP", "JE", "JNE", "JC", "JNC", "JZ", "JNZ", "JA", "JNA", "JB", "JNB",
    "PUSH", "PUSHB", "POP", "POPB", "CALL", "RET", "MUL", "MULB", "DIV", "DIVB", "AND", "ANDB",
    "OR", "ORB", "XOR", "XORB", "NOT", "NOTB", "SHL", "SHLB", "SHR", "SHRB", "CLI", "STI",
    "IRET", "IN", "OUT", "DB", "DW"
];

// .sort() is needed here to fix the common issue of matching "keywordB" without considering "B".
export const keywordsRegex = new RegExp(`(\\b${[...keywords].sort((a, b) => b.length - a.length).join("|")})(?=\\s|$)`);

const variableKeywords = ["JMP", "JE", "JNE", "JC", "JNC", "JZ", "JNZ", "JA", "JNA", "JB", "JNB", "CALL"];
export const variableKeywordsRegex = new RegExp(`(\\b${variableKeywords.join("|")})(?=\\s)`);