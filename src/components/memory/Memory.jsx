import { useState, useEffect, useContext, useCallback } from "react";
import HighSpeedBlock from "../HighSpeedBlock";
import MemoryMap from "./MemoryMap";
import { GlobalContext } from "../../context/GlobalContext";
import { Manager } from "../../helpers/Manager";

const Memory = () => {
    const { assembler } = useContext(GlobalContext);

    const initialRAM = {
        instructions: [],
        stackStart: 0
    };
    
    const [ram, setRAM] = useState(initialRAM);

    const [isSplitActive, setIsSplitActive] = useState(false);

    const toggleSplit = useCallback(() => {
        setIsSplitActive(prevIsSplitActive => !prevIsSplitActive);
    }, []);
    
    useEffect(() => {
        const unsubscribeRAMUpdate = Manager.subscribe("ramUpdate", ram => {
            if(ram) setRAM(prevRAM => prevRAM.instructions === ram.instructions && prevRAM.stackStart === ram.stackStart ? prevRAM : ram);
        });

        const unsubscribeReset = Manager.subscribe("ramReset", () => {
            setRAM(initialRAM);
        });

        const unsubscribeLinesUpdate = Manager.subscribe("linesUpdate", lines => {
            assembler.lines.collection = lines.collection;
        });
    
        return () => {
            unsubscribeRAMUpdate();
            unsubscribeReset();
            unsubscribeLinesUpdate();
        };
    }, []);

    return(
        <div className="memory">
            <div className="memory-header">
                <strong>Memory</strong>
                
                <button
                    className={isSplitActive ? "memory-header-split-button-active" : ""}
                    onClick={toggleSplit}
                >Split</button>
            </div>

            <div className="memory-map-holder">
                <HighSpeedBlock />
                
                <MemoryMap
                    ram={ram}
                    isSplitActive={isSplitActive}
                />

                {/*isSplitActive && <MemoryMap
                    ram={ram}
                    isSplitActive={isSplitActive}
                />*/}
            </div>
        </div>
    );
}

export default Memory;