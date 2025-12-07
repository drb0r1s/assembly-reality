import { useState, useEffect, useContext } from "react";
import HighSpeedBlock from "../HighSpeedBlock";
import MemoryMap from "./MemoryMap";
import { GlobalContext } from "../../context/GlobalContext";
import { Manager } from "../../Manager";

const Memory = () => {
    const { assembler } = useContext(GlobalContext);

    const initialMemory = {
        instructions: [],
        stackStart: 0
    };
    
    const [memory, setMemory] = useState(initialMemory);
    const [cpuRegisters, setCPURegisters] = useState(assembler.cpuRegisters.construct());

    const [isSplitActive, setIsSplitActive] = useState(false);
    
    useEffect(() => {
        const unsubscribeMemoryUpdate = Manager.subscribe("memoryUpdate", data => {
            if(data?.memory) setMemory({
                instructions: data.memory.instructions,
                stackStart: data.memory.stackStart
            });

            setCPURegisters(assembler.cpuRegisters.construct());
        });

        const unsubscribeReset = Manager.subscribe("memoryReset", () => {
            setMemory(initialMemory);
            setCPURegisters(assembler.cpuRegisters.construct());
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
                <HighSpeedBlock />
                
                <MemoryMap
                    memory={memory}
                    cpuRegisters={cpuRegisters}
                    isSplitActive={isSplitActive}
                />

                {isSplitActive && <MemoryMap
                    memory={memory}
                    cpuRegisters={cpuRegisters}
                    isSplitActive={isSplitActive}
                />}
            </div>
        </div>
    );
}

export default Memory;