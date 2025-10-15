import { useEffect, useRef } from "react"
import { useMonaco } from "@monaco-editor/react";
import { tokenizer } from "../data/richEditor/tokenizer";
import { colors, rules } from "../data/richEditor/style";

export const useRichEditor = () => {
    const editorRef = useRef(null);
    const monaco = useMonaco();

    useEffect(() => {
        if(!monaco) return;

        monaco.languages.register({ id: "assembly" });
        monaco.languages.setMonarchTokensProvider("assembly", { tokenizer });

        monaco.editor.defineTheme("assembly-dark", {
            base: "vs-dark",
            inherit: true,
            rules,
            colors,
        });

        monaco.editor.setTheme("assembly-dark");
    }, [monaco]);

    function handleEditorDidMount(editor) {
        editorRef.current = editor;
    }

    return handleEditorDidMount;
}