import { useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

const RichEditor = ({ code, onChange }) => {
    const editorRef = useRef(null);
    const monaco = useMonaco();

    useEffect(() => {
        if(!monaco) return;

        monaco.languages.register({ id: "assembly" });

        monaco.languages.setMonarchTokensProvider("assembly", {
            tokenizer: {
                root: [
                    [/[;].*$/, "comment"],             // Comments
                    [/\b(MOV|ADD|SUB|MUL|DIV|JMP|CMP|JE|JNE|CALL|RET)\b/, "keyword"],
                    [/\b(R[0-9]+)\b/, "variable"],     // Registers
                    [/\b(0x[0-9A-Fa-f]+|\d+)\b/, "number"], // Numbers
                    [/"[^"]*"/, "string"],
                ]
            }
        });

        monaco.editor.defineTheme("assembly-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
                { token: "keyword", foreground: "ff7b72" },
                { token: "variable", foreground: "7cdfff" },
                { token: "number", foreground: "c8ff8c" },
                { token: "comment", foreground: "6a9955", fontStyle: "italic" },
            ],
            colors: {
                "editor.background": "#000000",
                "editorLineNumber.foreground": "#000000",
                "editorCursor.foreground": "#000000",
                "editor.selectionBackground": "#264f78",
            },
        });

        monaco.editor.setTheme("assembly-dark");
    }, [monaco]);

    function handleEditorDidMount(editor) {
        editorRef.current = editor;
    }
    
    return(
        <div className="editor">
            <Editor
                height="400px"
                defaultLanguage="assembly"
                value={code}
                onMount={handleEditorDidMount}
                theme="assembly-dark"
                onChange={onChange}
            />
        </div>
    );
}

export default RichEditor;