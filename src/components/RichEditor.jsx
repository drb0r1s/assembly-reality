import React, { useMemo } from "react";
import Editor from "@monaco-editor/react";
import Loading from "./Loading";
import { useRichEditor } from "../hooks/useRichEditor";
import { useResize } from "../hooks/useResize";
import { useManagerValue } from "../hooks/useManagerValue";

const RichEditor = React.memo(({ code, onChange }) => {
    const { handleEditorDidMount, isLoading } = useRichEditor();

    const width = useResize();
    const isLightTheme = useManagerValue("isLightTheme"); 

    const richEditorStyle = useMemo(() => { return {
        height: width >= 900 ? "calc(100% - 40px)" : "calc(100% - 40px - 48px)",
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