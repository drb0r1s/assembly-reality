export const dark = {
    colors: {
        "editor.background": "#000000",
        "editorLineNumber.foreground": "#A0A0A0",
        "editorLineNumber.activeForeground": "#F4F4F4",
        "editorCursor.foreground": "#F4F4F4",
        "editor.selectionBackground": "#405A85",
        "editor.lineHighlightBorder": "#000000"
    },

    rules: [
        { token: "keyword", foreground: "C586C0" },
        { token: "definitionLabel", foreground: "9CDCFE" },
        { token: "referenceLabel", foreground: "7EBBE0" },
        { token: "memoryReferenceLabel", foreground: "5B91B0" },
        { token: "register", foreground: "4EC9B0" },
        { token: "memoryRegister", foreground: "3DA18C" },
        { token: "halfRegister", foreground: "DCDCAA" },
        { token: "number", foreground: "B5CEA8" },
        { token: "memoryNumber", foreground: "9BB98E" },
        { token: "stringDouble", foreground: "CE9178" },
        { token: "stringSingle", foreground: "ECC6B9" },
        { token: "comment", foreground: "6A9955", fontStyle: "italic" }
    ]
};

export const light = {
    colors: {
        "editor.background": "#FFFFFF",
        "editorLineNumber.foreground": "#9A9A9A",
        "editorLineNumber.activeForeground": "#1A1A1A",
        "editorCursor.foreground": "#1A1A1A",
        "editor.selectionBackground": "#C7D7F2",
        "editor.lineHighlightBorder": "#FFFFFF"
    },

    rules: [
        { token: "keyword", foreground: "7A3E9D" },
        { token: "definitionLabel", foreground: "005FB8" },
        { token: "referenceLabel", foreground: "1F6FA5" },
        { token: "memoryReferenceLabel", foreground: "3E6F8E" },
        { token: "register", foreground: "007A6E" },
        { token: "memoryRegister", foreground: "2F7D6B" },
        { token: "halfRegister", foreground: "8A6F00" },
        { token: "number", foreground: "2F7D32" },
        { token: "memoryNumber", foreground: "4C6F3E" },
        { token: "stringDouble", foreground: "A23D1F" },
        { token: "stringSingle", foreground: "8C4A3A" },
        { token: "comment", foreground: "5F7F55", fontStyle: "italic" }
    ]
};