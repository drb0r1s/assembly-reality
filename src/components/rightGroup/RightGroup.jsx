import { useRef } from "react";
import { useSelector } from "react-redux";
import IODevices from "./IODevices";
import CPURegisters from "./CPURegisters";
import IORegisters from "./IORegisters";
import Signature from "./Signature";

const RightGroup = () => {
    const rightGroupRef = useRef(null);
    const ioDevicesRef = useRef(null);
    const cpuRegistersRef = useRef(null);
    const ioRegistersRef = useRef(null);
    
    const mainReducer = useSelector(state => state.main);
    
    return(
        <div className="right-group" ref={rightGroupRef}>
            <div className="right-group-content">
                <Signature />
                
                {mainReducer.view.ioDevices && <IODevices
                    rightGroupRef={rightGroupRef}
                    ioDevicesRef={ioDevicesRef}
                    cpuRegistersRef={cpuRegistersRef}
                    ioRegistersRef={ioRegistersRef}
                />}

                {mainReducer.view.cpuRegisters && <CPURegisters
                    rightGroupRef={rightGroupRef}
                    ioDevicesRef={ioDevicesRef}
                    cpuRegistersRef={cpuRegistersRef}
                    ioRegistersRef={ioRegistersRef}
                />}
                
                {mainReducer.view.ioRegisters && <IORegisters
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