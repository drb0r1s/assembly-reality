import { useEffect, useRef } from "react";
import { Images } from "../../data/Images";

const EditorError = ({ error, setError }) => {
    const editorErrorRef = useRef(null);

    useEffect(() => {
        setTimeout(() => {
            editorErrorRef.current.style.opacity = "1";
            editorErrorRef.current.style.bottom = "0";
        }, 100);
    }, []);

    function disableEditorError() {
        editorErrorRef.current.style.opacity = "";
        editorErrorRef.current.style.bottom = "";

        setTimeout(() => setError({ type: "", content: "" }), 300);
    }
    
    return(
        <div className="editor-error" ref={editorErrorRef}>
            <button onClick={disableEditorError}><Images.XIcon /></button>
            <p>{error.isRuntime ? "RUNTIME ": ""}ERROR ({error.type}): {error.content}{error.line ? ` @ line ${error.line}` : ""}</p>
        </div>
    );
}

export default EditorError;