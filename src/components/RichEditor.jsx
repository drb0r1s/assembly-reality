import React, { useState, useEffect, useMemo } from "react";
import Editor from "@monaco-editor/react";
import Loading from "./Loading";
import { useRichEditor } from "../hooks/useRichEditor";
import { useResize } from "../hooks/useResize";
import { useManagerValue } from "../hooks/useManagerValue";

const RichEditor = React.memo(({ code, onChange }) => {
    const { handleEditorDidMount, isLoading } = useRichEditor();

    const width = useResize();
    const isLightTheme = useManagerValue("isLightTheme"); 

    const [fontSize, setFontSize] = useState(14);

    const richEditorStyle = useMemo(() => { return {
        height: width >= 900 ? "calc(100% - 40px)" : "calc(100% - 40px - 48px)",
        width: "100%"
    }}, []);

    const editorOptions = useMemo(() => { return {
        fontSize,
        fontFamily: "SourceCodePro-Regular"
    }}, [fontSize]);

    useEffect(() => {
        const handleKeydown = e => {
            if(!e.ctrlKey) return;

            if(e.key === "=" || e.key === "+") {
                e.preventDefault();
                setFontSize(prev => Math.min(prev + 1, 40));
            }

            else if(e.key === "-") {
                e.preventDefault();
                setFontSize(prev => Math.max(prev - 1, 8));
            }

            else if(e.key === "0") {
                e.preventDefault();
                setFontSize(14);
            }
        }

        window.addEventListener("keydown", handleKeydown);
        return () => { window.removeEventListener("keydown", handleKeydown) }
    }, []);
    
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