import React from "react";
import Editor from "@monaco-editor/react";
import { useRichEditor } from "../hooks/useRichEditor";

const RichEditor = ({ code, onChange }) => {
    const handleEditorDidMount = useRichEditor();
    
    return(
        <div className="rich-editor" style={{ height: "calc(100% - 35px)", width: "100%" }}>
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