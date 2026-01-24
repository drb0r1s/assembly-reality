import { useState, useEffect, useRef, useContext } from "react";
import DraggableHeader from "../DraggableHeader";
import HighSpeedBlock from "../HighSpeedBlock";
import { GlobalContext } from "../../context/GlobalContext";
import { useLinkedResizing } from "../../hooks/useLinkedResizing";
import { Manager } from "../../helpers/Manager";

const CPURegisters = ({ rightGroupRef, ioDevicesRef, cpuRegistersRef, ioRegistersRef }) => {
    const { assembler } = useContext(GlobalContext);
    
    const [cpuRegisters, setCPURegisters] = useState(assembler.cpuRegisters.construct());
    
    const headerRef = useRef(null);

    useEffect(() => {
        const unsubscribeCPURegisterPing = Manager.subscribe("cpuRegistersPing", () => setCPURegisters(assembler.cpuRegisters.construct()));
        return unsubscribeCPURegisterPing;
    }, []);

    useLinkedResizing({
        headerRef,
        elementRef: cpuRegistersRef,
        holderRef: rightGroupRef,
        collisionRefs: { prev: ioDevicesRef, next: ioRegistersRef }
    });
    
    return(
        <div className="cpu-registers" ref={cpuRegistersRef}>
            <DraggableHeader
                title="CPU Registers"
                ref={headerRef}
            />

            <div className="cpu-registers-content">
                <HighSpeedBlock />
                
                <div className="cpu-registers-row">
                    <div className="cpu-registers-row-register">
                        <strong>A</strong>
                        <p>{cpuRegisters.A.toString(16).toUpperCase().padStart(4, "0")}</p>
                    </div>

                    <div className="cpu-registers-row-register">
                        <strong>B</strong>
                        <p>{cpuRegisters.B.toString(16).toUpperCase().padStart(4, "0")}</p>
                    </div>

                    <div className="cpu-registers-row-register">
                        <strong>C</strong>
                        <p>{cpuRegisters.C.toString(16).toUpperCase().padStart(4, "0")}</p>
                    </div>

                    <div className="cpu-registers-row-register">
                        <strong>D</strong>
                        <p>{cpuRegisters.D.toString(16).toUpperCase().padStart(4, "0")}</p>
                    </div>
                </div>

                <div className="cpu-registers-row">
                    <div className="cpu-registers-row-register cpu-ip-register">
                        <strong>IP</strong>
                        <p>{cpuRegisters.IP.toString(16).toUpperCase().padStart(4, "0")}</p>
                    </div>

                    <div className="cpu-registers-row-register cpu-sp-register">
                        <strong>SP</strong>
                        <p>{cpuRegisters.SP.toString(16).toUpperCase().padStart(4, "0")}</p>
                    </div>

                    <div className="cpu-registers-row-register">
                        <strong>SR</strong>

                        <div className="cpu-registers-row-sr-values">
                            {Object.keys(cpuRegisters.SR).map((key, index) => {
                                const value = Object.values(cpuRegisters.SR)[index];

                                return <div
                                    key={index}
                                    className="cpu-registers-row-sr-value"
                                >
                                    <p>{key}</p>
                                    <p>{value}</p>
                                </div>;
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CPURegisters;