import React, { useMemo } from "react";
import Editor from "@monaco-editor/react";
import Loading from "./Loading";
import { useRichEditor } from "../hooks/useRichEditor";
import { useManagerValue } from "../hooks/useManagerValue";

const RichEditor = React.memo(({ code, onChange }) => {
    const { handleEditorDidMount, isLoading } = useRichEditor();
    const isLightTheme = useManagerValue("isLightTheme");

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
            {isLoading && <Loading />}

            <Editor
                height="100%"
                defaultLanguage="assembly"
                theme={`assembly-${isLightTheme ? "light" : "dark"}`}
                value={code}
                onChange={onChange}
                onMount={handleEditorDidMount}
                options={editorOptions}
            />
        </div>
    );
});

export default RichEditor;