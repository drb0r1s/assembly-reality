import { useState, useEffect, useContext } from "react";
import HighSpeedBlock from "../HighSpeedBlock";
import MemoryMatrix from "./MemoryMatrix";
import { GlobalContext } from "../../context/GlobalContext";
import { Manager } from "../../helpers/Manager";

const Memory = ({ memoryRef }) => {
    const { assembler } = useContext(GlobalContext);

    const initialRAM = {
        instructions: [],
        stackStart: 0
    };
    
    const [ram, setRAM] = useState(initialRAM);
    
    useEffect(() => {
        const unsubscribeRAMUpdate = Manager.subscribe("ramUpdate", ram => {
            if(ram) setRAM(prevRAM => prevRAM.instructions === ram.instructions && prevRAM.stackStart === ram.stackStart ? prevRAM : ram);
        });

        const unsubscribeReset = Manager.subscribe("ramReset", () => {
            setRAM(initialRAM);
        });

        const unsubscribeLinesUpdate = Manager.subscribe("linesUpdate", lines => {
            if(lines?.collection) assembler.lines.collection = lines.collection;
        });
    
        return () => {
            unsubscribeRAMUpdate();
            unsubscribeReset();
            unsubscribeLinesUpdate();
        };
    }, []);

    return(
        <div className="memory" ref={memoryRef}>
            <div className="memory-header">
                <strong>Memory</strong>
            </div>

            <div className="memory-matrix-holder">
                <HighSpeedBlock />
                <MemoryMatrix ram={ram} />
            </div>
        </div>
    );
}

export default Memory;