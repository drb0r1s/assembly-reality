import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import RichEditor from "../RichEditor";
import EditorError from "./EditorError";
import { mainActions } from "../../state/reducers/mainSlice";
import { Assembler } from "../../assembler/Assembler";

const Editor = () => {
    const [code, setCode] = useState("");
    const [isError, setIsError] = useState(false);

    const { assemble } = useSelector(state => state.main);
    const dispatch = useDispatch();

    useEffect(() => {
        if(!assemble) return;

        Assembler.assemble(code);
        dispatch(mainActions.updateAssemble(false));
    }, [assemble]);
    
    return(
        <div className="editor">
            <RichEditor code={code} onChange={setCode} />
            {isError && <EditorError setIsError={setIsError} />}
        </div>
    );
}

export default Editor;