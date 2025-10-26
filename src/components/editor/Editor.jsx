import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import RichEditor from "../RichEditor";
import EditorError from "./EditorError";
import { mainActions } from "../../state/reducers/mainSlice";

const Editor = ({ assembler }) => {
    const [code, setCode] = useState("");
    const [error, setError] = useState({ type: "", content: "" });

    const { assemble, run } = useSelector(state => state.main);
    const dispatch = useDispatch();

    useEffect(() => {
        if(!assemble) return;

        const memoryMatrix = assembler.assemble(code);
        if(memoryMatrix?.error) setError(memoryMatrix.error);

        dispatch(mainActions.updateAssemble(false));
    }, [assemble]);

    useEffect(() => {
        if(!run) return;

        const result = assembler.execute();
        if(result?.error) setError(result.error);

        dispatch(mainActions.updateRun(false));
    }, [run]);
    
    return(
        <div className="editor">
            <RichEditor code={code} onChange={setCode} />
            {error.type && <EditorError error={error} setError={setError} />}
        </div>
    );
}

export default Editor;