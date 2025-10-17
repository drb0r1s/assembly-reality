import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import RichEditor from "../RichEditor";
import EditorError from "./EditorError";
import { mainActions } from "../../state/reducers/mainSlice";
import { Assembler } from "../../assembler/Assembler";

const Editor = () => {
    const [code, setCode] = useState("");
    const [error, setError] = useState({ type: "", content: "" });

    const { assemble } = useSelector(state => state.main);
    const dispatch = useDispatch();

    useEffect(() => {
        if(!assemble) return;

        const memoryMapMatrix = Assembler.assemble(code);
        if(memoryMapMatrix.error) setError(memoryMapMatrix.error);

        dispatch(mainActions.updateAssemble(false));
    }, [assemble]);
    
    return(
        <div className="editor">
            <RichEditor code={code} onChange={setCode} />
            {error.type && <EditorError error={error} setError={setError} />}
        </div>
    );
}

export default Editor;