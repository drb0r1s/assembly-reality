import { useEffect, useRef } from "react"
import { useMonaco } from "@monaco-editor/react";
import { tokenizer } from "../data/richEditor/tokenizer";
import { colors, rules } from "../data/richEditor/style";
import { Keywords } from "../assembler/frontend/Keywords";

export const useRichEditor = () => {
    const editorRef = useRef(null);
    const monaco = useMonaco();

    useEffect(() => {
        if(!monaco) return;

        monaco.languages.register({ id: "assembly" });
        monaco.languages.setMonarchTokensProvider("assembly", { tokenizer });

        let provider;

        if(!editorRef.current?.providerRegistered) provider = monaco.languages.registerCompletionItemProvider("assembly", {
            provideCompletionItems: model => {
                const text = model.getValue();

                const suggestions = {
                    keyword: Keywords.list.map(keyword => ({
                        label: keyword,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: keyword,
                        documentation: `Assembly instruction: ${keyword}.`
                    })),

                    label: getLabel(text).map(label => ({
                        label,
                        kind: monaco.languages.CompletionItemKind.Variable,
                        insertText: label,
                        documentation: "User-defined label."
                    }))
                };

                const suggestionsArray = [...suggestions.keyword, ...removeDuplicates(suggestions.label)];
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

        return () => {
            provider?.dispose();
        }
    }, [monaco]);

    function handleEditorDidMount(editor) {
        editorRef.current = editor;
    }

    function getLabel(text) {
        const labelRegex = /^[a-zA-Z0-9_]+(?=:)/gm;
        const matches = [...text.matchAll(labelRegex)];
        
        return matches.map(match => match[0]);
    }

    // If one label appears multiple times in the code, it will appear the same amount of times in the suggestions, as well.
    // That is why this function is needed, to get rid of duplicated suggestions.
    function removeDuplicates(array) {
        const newArray = [];
        const labels = [];

        for(let i = 0; i < array.length; i++) {
            if(labels.indexOf(array[i].label) === -1) {
                newArray.push(array[i]);
                labels.push(array[i].label);
            }
        }

        return newArray;
    }

    return handleEditorDidMount;
}