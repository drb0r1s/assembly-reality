export const keywords = [
    "HLT", "MOV", "MOVB", "ADD", "ADDB", "SUB", "SUBB", "INC", "INCB", "DEC", "DECB",
    "CMP", "CMPB", "JMP", "JC", "JB", "JNAE", "JNC", "JAE", "JNB", "JZ", "JE", "JNZ", "JNE", "JA", "JNBE", "JNA", "JBE",
    "PUSH", "PUSHB", "POP", "POPB", "CALL", "RET", "MUL", "MULB", "DIV", "DIVB", "AND", "ANDB",
    "OR", "ORB", "XOR", "XORB", "NOT", "NOTB", "SHL", "SHLB", "SHR", "SHRB", "CLI", "STI",
    "IRET", "IN", "OUT", "DB", "DW", "ORG"
];

// .sort() is needed here to fix the common issue of matching "keywordB" without considering "B".
export const rootKeywordsExpression = `(${[...keywords].sort((a, b) => b.length - a.length).join("|")})(?=\\s|$)`;

// This is a default keyword regex, requiring a keyword to be at the beginning of the line.
export const keywordsRegex = new RegExp(`^${rootKeywordsExpression}`);
// This is a special (middle) keyword regex, in case keyword is located in the middle of the line. (e.g. DW)
export const middleKeywordsRegex = new RegExp(`\\s${rootKeywordsExpression}`);

export const jumpKeywords = ["JMP", "JC", "JB", "JNAE", "JNC", "JAE", "JNB", "JZ", "JE", "JNZ", "JNE", "JA", "JNBE", "JNA", "JBE", "CALL"];