import { useState, useEffect } from "react";
import RichEditor from "../RichEditor";
import EditorError from "./EditorError";
import { Manager } from "../../Manager";

const Editor = ({ assembler }) => {
    const [code, setCode] = useState("");
    const [error, setError] = useState({ type: "", content: "" });

    useEffect(() => {
        const unsubscribeAssemble = Manager.subscribe("assemble", () => {
            const memoryMatrix = assembler.assemble(code);
            if(memoryMatrix?.error) setError(memoryMatrix.error);
        });

        const unsubscribeRun = Manager.subscribe("run", () => {
            const result = assembler.execute();
            if(result?.error) setError(result.error);
        });

        return () => {
            unsubscribeAssemble();
            unsubscribeRun();
        };
    }, [code]);
    
    return(
        <div className="editor">
            <RichEditor code={code} onChange={setCode} />
            {error.type && <EditorError error={error} setError={setError} />}
        </div>
    );
}

export default Editor;