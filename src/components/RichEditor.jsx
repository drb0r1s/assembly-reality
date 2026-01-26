import React, { useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useRichEditor } from "../hooks/useRichEditor";
import { Manager } from "../helpers/Manager";

const RichEditor = ({ code, onChange }) => {
    const { handleEditorDidMount, highlightLine } = useRichEditor();

    useEffect(() => {
        const unsubscribeHighlightLine = Manager.subscribe("highlightLine", line => {
            highlightLine(line);
        });

        return unsubscribeHighlightLine;
    }, []);
    
    return(
        <div className="rich-editor" style={{ height: "calc(100% - 40px)", width: "100%" }}>
            <Editor
                height="100%"
                defaultLanguage="assembly"
                theme="assembly-dark"
                value={code}
                onChange={onChange}
                onMount={handleEditorDidMount}
                options={{
                    fontSize: 14,
                    fontFamily: "SourceCodePro-Regular"
                }}
            />
        </div>
    );
}

export default React.memo(RichEditor);