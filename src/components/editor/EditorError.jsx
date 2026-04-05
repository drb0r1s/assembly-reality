import { useEffect, useRef } from "react";
import { useResize } from "../../hooks/useResize";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Images } from "../../data/Images";

const EditorError = ({ error, setError }) => {
    const editorErrorRef = useRef(null);
    const wasDisplayExpandedRef = useRef(false);

    const width = useResize();

    const isDisplayExpanded = useManagerValue("isDisplayExpanded");

    useEffect(() => {
        setTimeout(() => {
            editorErrorRef.current.style.opacity = "1";

            if(isDisplayExpanded) {
                const editorErrorBottom = getComputedStyle(editorErrorRef.current).getPropertyValue("bottom");

                if(editorErrorBottom !== "auto") {
                    wasDisplayExpandedRef.current = true;

                    editorErrorRef.current.style.opacity = "";
                    editorErrorRef.current.style.bottom = "";
                    
                    setTimeout(() => {
                        editorErrorRef.current.style.transition = "0ms";

                        editorErrorRef.current.id = "editor-error-expanded-display";
                        
                        editorErrorRef.current.style.transition = "";

                        setTimeout(() => {
                            editorErrorRef.current.style.top = "0";
                            editorErrorRef.current.style.opacity = "1";
                        }, 10);
                    }, 300);
                }

                else {
                    editorErrorRef.current.style.top = "0";
                    editorErrorRef.current.style.bottom = "";
                }
            }

            else {
                if(wasDisplayExpandedRef.current) {
                    wasDisplayExpandedRef.current = false;

                    editorErrorRef.current.style.opacity = "";
                    editorErrorRef.current.style.top = "-20px";
                    
                    setTimeout(() => {
                        editorErrorRef.current.style.transition = "0ms";

                        editorErrorRef.current.id = "";
                        editorErrorRef.current.style.top = "";

                        editorErrorRef.current.style.transition = "";

                        setTimeout(() => {
                            editorErrorRef.current.style.bottom = "0";
                            editorErrorRef.current.style.opacity = "1";
                        }, 10);
                    }, 300);
                }

                else {
                    editorErrorRef.current.style.top = "";
                    editorErrorRef.current.style.bottom = (width < 900 ? "48px" : "0"); // 48px = MobileNavigation height
                }
            }
        }, 100);
    }, [isDisplayExpanded]);

    function disableEditorError() {
        editorErrorRef.current.style.opacity = "";
        
        if(isDisplayExpanded) editorErrorRef.current.style.top = "";
        else editorErrorRef.current.style.bottom = "";

        setTimeout(() => setError({ type: "", content: "" }), 300);
    }
    
    return(
        <div className="editor-error" ref={editorErrorRef}>
            <button onClick={disableEditorError}><Images.XIcon /></button>
            
            <Images.ErrorIcon className="editor-error-icon" />
            <p>{error.isRuntime ? "RUNTIME ": ""}ERROR ({error.type}): {error.content}{error.line ? ` @ line ${error.line}` : ""}</p>
        </div>
    );
}

export default EditorError;