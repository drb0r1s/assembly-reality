import { useEffect, useRef } from "react";
import { useResize } from "../../hooks/useResize";
import { Images } from "../../data/Images";

const EditorError = ({ error, setError }) => {
    const editorErrorRef = useRef(null);
    const width = useResize();

    useEffect(() => {
        setTimeout(() => {
            editorErrorRef.current.style.opacity = "1";
            editorErrorRef.current.style.bottom = (width < 900 ? "48px" : "0"); // 48px = MobileNavigation height
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