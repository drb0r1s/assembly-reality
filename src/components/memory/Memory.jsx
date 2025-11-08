import { useState, useEffect, useContext } from "react";
import MemoryMap from "./MemoryMap";
import { GlobalContext } from "../../context/GlobalContext";
import { Manager } from "../../Manager";

const Memory = () => {
    const { assembler } = useContext(GlobalContext);
    
    const [memoryMatrix, setMemoryMatrix] = useState(assembler.memory.matrix);
    const [memoryInstructions, setMemoryInstructions] = useState({ index: 0, list: [] });
    const [registerPointers, setRegisterPointers] = useState({ IP: assembler.registers.IP, SP: assembler.registers.SP });

    const [isSplitActive, setIsSplitActive] = useState(false);
    
    useEffect(() => {
        const unsubscribeMemoryUpdate = Manager.subscribe("memoryUpdate", data => {
            if(data?.memory) {
                setMemoryMatrix([...data.memory.matrix]);
                setMemoryInstructions({ index: data.memory.instructionIndex, list: data.memory.instructions });
            }

            if(data?.registers) setRegisterPointers({ IP: data.registers.IP, SP: data.registers.SP });
        });

        const unsubscribeReset = Manager.subscribe("memoryReset", () => {
            setMemoryMatrix(new Uint8Array(258 * 16));
            setMemoryInstructions({ index: 0, pointer: 0, list: [] });
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
                    registerPointers={registerPointers}
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