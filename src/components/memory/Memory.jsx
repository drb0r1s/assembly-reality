import { useState, useEffect, useRef, useContext } from "react";
import HighSpeedBlock from "../HighSpeedBlock";
import MemoryMatrix from "./MemoryMatrix";
import DraggableHeader from "../DraggableHeader";
import { GlobalContext } from "../../context/GlobalContext";
import { useResize } from "../../hooks/useResize";
import { useLinkedResizing } from "../../hooks/useLinkedResizing";
import { Manager } from "../../helpers/Manager";

const Memory = ({ rightGroupRef, elements, allElementRefs }) => {
    const { assembler } = useContext(GlobalContext);

    const initialRAM = {
        instructions: [],
        stackStart: 0
    };
    
    const [ram, setRAM] = useState(initialRAM);
    const headerRef = useRef(null);

    const width = useResize();

    // Applied only for screen widths < 1300.
    useLinkedResizing({
        headerRef,
        elementRefs: elements ? elements.refs : null,
        targetIndex: elements ? elements.getOrder("memory") : null,
        holderRef: rightGroupRef,
        conditional: true
    });
    
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
        <div className="memory" ref={elements ? allElementRefs[3] : null}>
            <DraggableHeader
                title="Memory"
                ref={headerRef}
                isDisabled={width >= 1300}
            />

            <div className="memory-matrix-holder">
                <HighSpeedBlock />
                <MemoryMatrix ram={ram} />
            </div>
        </div>
    );
}

export default Memory;