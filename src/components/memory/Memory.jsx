import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import MemoryMap from "./MemoryMap";
import { mainActions } from "../../state/reducers/mainSlice";

const Memory = ({ assembler }) => {
    const [memoryMatrix, setMemoryMatrix] = useState(assembler.memory.matrix);
    const [isSplitActive, setIsSplitActive] = useState(false);

    const mainReducer = useSelector(state => state.main);
    const dispatch = useDispatch();
    
    useEffect(() => {
        assembler.onMemoryChange = matrix => { setMemoryMatrix([...matrix]) }
    }, []);

    useEffect(() => {
        if(!mainReducer.reset) return;

        assembler.memoryReset();
        setMemoryMatrix(assembler.memory.matrix);

        dispatch(mainActions.updateReset(false));
    }, [mainReducer.reset]);

    return(
        <div className="memory">
            <div className="memory-header">
                <strong>Memory</strong>
                
                <button
                    className={isSplitActive ? "memory-header-split-button-active" : ""}
                    onClick={() => setIsSplitActive(!isSplitActive)}
                >Split</button>
            </div>

            <div className="memory-map-holder">
                <MemoryMap
                    memoryMatrix={memoryMatrix}
                    isSplitActive={isSplitActive}
                />
                {isSplitActive && <MemoryMap
                    memoryMatrix={memoryMatrix}
                    isSplitActive={isSplitActive}
                />}
            </div>
        </div>
    );
}

export default Memory;