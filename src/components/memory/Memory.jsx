import { useState, useEffect, useContext } from "react";
import MemoryMap from "./MemoryMap";
import { GlobalContext } from "../../context/GlobalContext";
import { Manager } from "../../Manager";

const Memory = () => {
    const { assembler } = useContext(GlobalContext);
    
    const [memoryMatrix, setMemoryMatrix] = useState(assembler.memory.matrix);
    const [memoryInstructions, setMemoryInstructions] = useState({ index: 0, list: [] });

    const [isSplitActive, setIsSplitActive] = useState(false);
    
    useEffect(() => {
        const unsubscribeMemoryUpdate = Manager.subscribe("memoryUpdate", newMemory => {
            setMemoryMatrix([...newMemory.matrix]);
            setMemoryInstructions({ index: newMemory.instructionIndex, list: newMemory.instructions });
        });

        const unsubscribeReset = Manager.subscribe("reset", () => {
            setMemoryMatrix(new Uint8Array(258 * 16));
            setMemoryInstructions({ index: 0, list: [] });
        });
    
        return () => {
            unsubscribeMemoryUpdate();
            unsubscribeReset();
        };
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
                    memoryInstructions={memoryInstructions}
                    isSplitActive={isSplitActive}
                />
                {isSplitActive && <MemoryMap
                    memoryMatrix={memoryMatrix}
                    memoryInstructions={memoryInstructions}
                    isSplitActive={isSplitActive}
                />}
            </div>
        </div>
    );
}

export default Memory;