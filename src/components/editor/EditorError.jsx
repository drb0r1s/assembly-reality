import { useEffect, useRef } from "react";
import { images } from "../../data/images";

const EditorError = ({ setIsError }) => {
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

        setTimeout(() => setIsError(false), 300);
    }
    
    return(
        <div className="editor-error" ref={editorErrorRef}>
            <button onClick={disableEditorError}><img src={images.xIcon} alt="X" /></button>
            <p>ERROR: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Alias exercitationem dignissimos, obcaecati voluptatibus non ullam eveniet? Ratione delectus aliquid rerum laudantium sapiente, impedit deleniti cupiditate fuga exercitationem repellat, voluptatem suscipit esse excepturi quod quas? Rem doloremque fugit incidunt nulla ipsum adipisci, tempore in sunt dignissimos repellat aut voluptate expedita earum?</p>
        </div>
    );
}

export default EditorError;