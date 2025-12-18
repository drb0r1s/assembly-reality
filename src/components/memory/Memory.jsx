import { useState, useEffect, useContext } from "react";
import HighSpeedBlock from "../HighSpeedBlock";
import MemoryMap from "./MemoryMap";
import { GlobalContext } from "../../context/GlobalContext";
import { Manager } from "../../Manager";

const Memory = () => {
    const { assembler } = useContext(GlobalContext);

    const initialRAM = {
        instructions: [],
        stackStart: 0
    };
    
    const [ram, setRAM] = useState(initialRAM);
    const [cpuRegisters, setCPURegisters] = useState(assembler.cpuRegisters.construct());

    const [isSplitActive, setIsSplitActive] = useState(false);
    
    useEffect(() => {
        const unsubscribeRAMUpdate = Manager.subscribe("ramUpdate", data => {
            if(data?.ram) setRAM({
                instructions: data.ram.instructions,
                stackStart: data.ram.stackStart
            });

            setCPURegisters(assembler.cpuRegisters.construct());
        });

        const unsubscribeReset = Manager.subscribe("ramReset", () => {
            setRAM(initialRAM);
            setCPURegisters(assembler.cpuRegisters.construct());
        });
    
        return () => {
            unsubscribeRAMUpdate();
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
                    ram={ram}
                    cpuRegisters={cpuRegisters}
                    isSplitActive={isSplitActive}
                />

                {isSplitActive && <MemoryMap
                    ram={ram}
                    cpuRegisters={cpuRegisters}
                    isSplitActive={isSplitActive}
                />}
            </div>
        </div>
    );
}

export default Memory;