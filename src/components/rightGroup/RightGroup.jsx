import { useEffect, useRef } from "react";
import IODevices from "./IODevices";
import CPURegisters from "./CPURegisters";
import IORegisters from "./IORegisters";
import Signature from "./Signature";
import { useManagerValue } from "../../hooks/useManagerValue";

const RightGroup = ({ assembler }) => {
    const rightGroupRef = useRef(null);
    const ioDevicesRef = useRef(null);
    const cpuRegistersRef = useRef(null);
    const ioRegistersRef = useRef(null);
    
    const view = useManagerValue("view");

    useEffect(() => {
        if(ioDevicesRef.current) ioDevicesRef.current.style.height = "";
        if(cpuRegistersRef.current) cpuRegistersRef.current.style.height = "";
        if(ioRegistersRef.current) ioRegistersRef.current.style.height = "";
    }, [view]);
    
    return(
        <div className="right-group" ref={rightGroupRef}>
            <div className="right-group-content">
                <Signature />
                
                {view.ioDevices && <IODevices
                    rightGroupRef={rightGroupRef}
                    ioDevicesRef={ioDevicesRef}
                    cpuRegistersRef={cpuRegistersRef}
                    ioRegistersRef={ioRegistersRef}
                />}

                {view.cpuRegisters && <CPURegisters
                    rightGroupRef={rightGroupRef}
                    ioDevicesRef={ioDevicesRef}
                    cpuRegistersRef={cpuRegistersRef}
                    ioRegistersRef={ioRegistersRef}
                />}
                
                {view.ioRegisters && <IORegisters
                    rightGroupRef={rightGroupRef}
                    ioDevicesRef={ioDevicesRef}
                    cpuRegistersRef={cpuRegistersRef}
                    ioRegistersRef={ioRegistersRef}
                />}
            </div>
        </div>
    );
}

export default RightGroup;