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

                let suggestionsArray = suggestions.keyword;
                if(suggestions.variable.length > 1) suggestionsArray = [...suggestionsArray, ...removeDuplicates(suggestions.variable)];

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