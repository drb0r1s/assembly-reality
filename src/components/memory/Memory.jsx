import { useState, useEffect, useContext } from "react";
import MemoryMap from "./MemoryMap";
import { GlobalContext } from "../../context/GlobalContext";
import { Manager } from "../../Manager";

const Memory = () => {
    const { assembler } = useContext(GlobalContext);
    
    const initialMemory = {
        matrix: new Uint8Array(258 * 16),
        instructions: [],
        instructionIndex: 0,
        stackStart: 0
    };
    
    const [memory, setMemory] = useState(initialMemory);
    const [registerPointers, setRegisterPointers] = useState({ IP: assembler.registers.IP, SP: assembler.registers.SP });

    const [isSplitActive, setIsSplitActive] = useState(false);
    
    useEffect(() => {
        const unsubscribeMemoryUpdate = Manager.subscribe("memoryUpdate", data => {
            if(data?.memory) setMemory({
                matrix: [...data.memory.matrix],
                instructions: data.memory.instructions,
                instructionIndex: data.memory.instructionIndex,
                stackStart: data.memory.stackStart
            });

            if(data?.registers) setRegisterPointers({ IP: data.registers.IP, SP: data.registers.SP });
        });

        const unsubscribeReset = Manager.subscribe("memoryReset", () => {
            setMemory(initialMemory);
            setRegisterPointers({ IP: 0, SP: 0 });
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
                    memory={memory}
                    registerPointers={registerPointers}
                    isSplitActive={isSplitActive}
                />
                {isSplitActive && <MemoryMap
                    memory={memory}
                    registerPointers={registerPointers}
                    isSplitActive={isSplitActive}
                />}
            </div>
        </div>
    );
}

export default Memory;