import React, { useMemo } from "react";
import Editor from "@monaco-editor/react";
import { useRichEditor } from "../hooks/useRichEditor";

const RichEditor = React.memo(({ code, onChange }) => {
    const handleEditorDidMount = useRichEditor();

    const richEditorStyle = useMemo(() => { return {
        height: "calc(100% - 40px)",
        width: "100%"
    }}, []);

    const editorOptions = useMemo(() => { return {
        fontSize: 14,
        fontFamily: "SourceCodePro-Regular"
    }}, []);
    
    return(
        <div className="rich-editor" style={richEditorStyle}>
            <Editor
                height="100%"
                defaultLanguage="assembly"
                theme="assembly-dark"
                value={code}
                onChange={onChange}
                onMount={handleEditorDidMount}
                options={editorOptions}
            />
        </div>
    );
});

export default RichEditor;