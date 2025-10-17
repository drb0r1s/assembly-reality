import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import RichEditor from "./RichEditor";
import { mainActions } from "../state/reducers/mainSlice";
import { Compiler } from "../compiler/compiler";

const Editor = () => {
    const [code, setCode] = useState("");

    const { assemble } = useSelector(state => state.main);
    const dispatch = useDispatch();

    useEffect(() => {
        if(!assemble) return;

        Compiler.assemble(code);
        dispatch(mainActions.updateAssemble(false));
    }, [assemble]);
    
    return(
        <div className="editor">
            <RichEditor code={code} onChange={setCode} />
        </div>
    );
}

export default Editor;