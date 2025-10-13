import { useState } from "react";
import RichEditor from "./RichEditor";

const Editor = () => {
    const [code, setCode] = useState("");
    
    return(
        <div className="editor">
            <RichEditor code={code} onChange={setCode} />
        </div>
    );
}

export default Editor;