import { useEffect, useRef } from "react"
import { useMonaco } from "@monaco-editor/react";
import { tokenizer } from "../data/richEditor/tokenizer";
import { colors, rules } from "../data/richEditor/style";
import { Keywords } from "../assembler/frontend/Keywords";
import { Manager } from "../helpers/Manager";

export const useRichEditor = () => {
    const editorRef = useRef(null);
    const providerRef = useRef(null);
    const decorationIdsRef = useRef([]);
    const highlightLineRef = useRef(() => {});

    const monaco = useMonaco();

    useEffect(() => {
        const unsubscribeHighlightLine = Manager.subscribe("highlightLine", line => {
            if(line === -1 || line === undefined) return;
            highlightLine(line);
        });

        const unsubscribeUnhighlightLine = Manager.subscribe("unhighlightLine", () => {
            unhighlightLine();
        });

        return () => {
            unsubscribeHighlightLine();
            unsubscribeUnhighlightLine();
        };
    }, []);

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

        return () => {
            providerRef.current?.dispose();
        }
    }, [monaco]);

    function handleEditorDidMount(editor, monacoInstance) {
        editorRef.current = editor;

        const monaco = monacoInstance;
        if(!monaco) return;

        if(!editorRef.current?.providerRegistered) {
            providerRef.current = monaco.languages.registerCompletionItemProvider("assembly", {
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

            editorRef.current.providerRegistered = true;
        }

        highlightLineRef.current = line => {
            decorationIdsRef.current = editorRef.current.deltaDecorations(
                decorationIdsRef.current,
                [
                    {
                        range: new monaco.Range(line, 1, line, 1),
                        options: {
                            isWholeLine: true,
                            className: "rich-editor-highlighted-line",
                            linesDecorationsClassName: "rich-editor-highlighted-line-gutter"
                        }
                    }
                ]
            );

            editorRef.current.revealLineInCenterIfOutsideViewport(line);
        }

        editor.onMouseDown(unhighlightLine);
        return () => editor.offMouseDown(unhighlightLine);
    }

    function getLabel(text) {
        const labelRegex = /^[a-zA-Z0-9_]+(?=:)/gm;
        const matches = [...text.matchAll(labelRegex)];
        
        return matches.map(match => match[0]);
    }

    // If one label appears multiple times in the code, it will appear the same amount of times in the suggestions, as well.
    // That is why this function is needed, to get rid of duplicated suggestions.
    function removeDuplicates(array) {
        const suggestions = new Set();

        return array.filter(suggestion => {
            if(suggestions.has(suggestion.label)) return false;
            
            suggestions.add(suggestion.label);
            return true;
        });
    }

    function highlightLine(line) {
        highlightLineRef.current(line);
    }

    function unhighlightLine() {
        decorationIdsRef.current = editorRef.current.deltaDecorations(
            decorationIdsRef.current,
            []
        );
    }

    return handleEditorDidMount;
}