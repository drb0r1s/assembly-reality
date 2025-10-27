import { useState, useEffect } from "react";
import MemoryMap from "./MemoryMap";
import { Manager } from "../../Manager";

const Memory = ({ assembler }) => {
    const [memoryMatrix, setMemoryMatrix] = useState(assembler.memory.matrix);
    const [isSplitActive, setIsSplitActive] = useState(false);
    
    useEffect(() => {
        assembler.memory.onChange = matrix => { setMemoryMatrix([...matrix]) }

        const unsubscribe = Manager.subscribe("reset", () => {
            assembler.memory.reset();
            setMemoryMatrix(assembler.memory.matrix);
        });
    
        return unsubscribe;
    }, []);

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