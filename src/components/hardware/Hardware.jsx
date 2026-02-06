import { useState, useEffect, useRef } from "react";
import IODevices from "./IODevices";
import CPURegisters from "./cpuRegisters/CPURegisters";
import IORegisters from "./ioRegisters/IORegisters";
import Memory from "../memory/Memory";
import Signature from "./Signature";
import MobileHeader from "../mobile/MobileHeader";
import { useResize } from "../../hooks/useResize";
import { useManagerValue } from "../../hooks/useManagerValue";

const Hardware = ({ style, onReturn }) => {
    const [elements, setElements] = useState({ refs: [], order: [], getOrder: () => {} });

    const hardwareRef = useRef(null);

    const ioDevicesRef = useRef(null);
    const cpuRegistersRef = useRef(null);
    const ioRegistersRef = useRef(null);
    const memoryRef = useRef(null);

    const width = useResize();
    const view = useManagerValue("view");

    const allElementRefs = [ioDevicesRef, cpuRegistersRef, ioRegistersRef, memoryRef];

    useEffect(() => {
        if(ioDevicesRef.current) ioDevicesRef.current.style.height = "";
        if(cpuRegistersRef.current) cpuRegistersRef.current.style.height = "";
        if(ioRegistersRef.current) ioRegistersRef.current.style.height = "";
        if(memoryRef.current) memoryRef.current.style.height = "";
    }, [view, width]);

    useEffect(() => {
        setElements(getElements());
    }, [view, width]);

    function getElements() {
        const elements = {
            refs: [],
            order: [],
            getOrder: order => elements.order.indexOf(order)
        };

        for(let i = 0; i < allElementRefs.length; i++) {
            if(allElementRefs[i].current) {
                elements.order.push(getName(i));
                elements.refs.push(allElementRefs[i]);
            }
        }

        return elements;

        function getName(index) {
            switch(index) {
                case 0: return "ioDevices";
                case 1: return "cpuRegisters";
                case 2: return "ioRegisters";
                case 3: return "memory"
            }
        }
    }
    
    return(
        <div className="hardware" style={style} ref={hardwareRef}>
            {width < 900 && <MobileHeader title="Hardware" onReturn={onReturn} />}
            
            <div className="hardware-content">
                <Signature />
                
                {view.ioDevices && <IODevices
                    hardwareRef={hardwareRef}
                    elements={elements}
                    allElementRefs={allElementRefs}
                />}

                {view.cpuRegisters && <CPURegisters
                    hardwareRef={hardwareRef}
                    elements={elements}
                    allElementRefs={allElementRefs}
                />}
                
                {view.ioRegisters && <IORegisters
                    hardwareRef={hardwareRef}
                    elements={elements}
                    allElementRefs={allElementRefs}
                />}

                {(width >= 900 && width < 1300) && view.memory && <Memory
                    hardwareRef={hardwareRef}
                    elements={elements}
                    allElementRefs={allElementRefs}
                />}
            </div>
        </div>
    );
}

export default Hardware;