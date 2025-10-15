import { useEffect, useRef } from "react"
import { useMonaco } from "@monaco-editor/react";
import { tokenizer } from "../data/richEditor/tokenizer";
import { colors, rules } from "../data/richEditor/style";
import { keywords } from "../data/richEditor/keywords";

export const useRichEditor = () => {
    const editorRef = useRef(null);
    const monaco = useMonaco();

    useEffect(() => {
        if(!monaco) return;

        monaco.languages.register({ id: "assembly" });
        monaco.languages.setMonarchTokensProvider("assembly", { tokenizer });

        monaco.languages.registerCompletionItemProvider("assembly", {
            provideCompletionItems: model => {
                const text = model.getValue();

                const suggestions = {
                    keyword: keywords.map(keyword => ({
                        label: keyword,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: keyword,
                        documentation: `Assembly instruction: ${keyword}.`
                    })),

                    variable: getVariable(text).map(variable => ({
                        label: variable,
                        kind: monaco.languages.CompletionItemKind.Variable,
                        insertText: variable,
                        documentation: "User-defined variable."
                    }))
                };

                const suggestionsArray = [...suggestions.keyword, ...suggestions.variable];
                return { suggestions: suggestionsArray };
            }
        });

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

    function getVariable(text) {
        const variableRegex = /[a-zA-Z0-9_]+/g;
        const matches = [...text.matchAll(variableRegex)];
        
        return matches.map(match => match[0]);
    }

    return handleEditorDidMount;
}