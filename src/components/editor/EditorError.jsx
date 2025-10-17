import { useEffect, useRef } from "react";
import { images } from "../../data/images";

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
            <button onClick={disableEditorError}><img src={images.xIcon} alt="X" /></button>
            <p>ERROR ({error.type}): {error.content}</p>
        </div>
    );
}

export default EditorError;