import { useState, useEffect, useRef } from "react";
import MiniHeader from "../MiniHeader";
import { useLinkedResizing } from "../../hooks/useLinkedResizing";
import { Manager } from "../../Manager";

const CPURegisters = ({ rightGroupRef, ioDevicesRef, cpuRegistersRef, ioRegistersRef }) => {
    const initialCPURegisters = {
        A: 0, B: 0, C: 0, D: 0,
        IP: 0, SP: 0,
        SR: { M: 0, C: 0, Z: 0, F: 0, H: 0 }
    };
    
    const [cpuRegisters, setCPURegisters] = useState(initialCPURegisters);
    
    const headerRef = useRef(null);

    useEffect(() => {
        const unsubscribeRegisterUpdate = Manager.subscribe("registerUpdate", newRegisters => setCPURegisters({...newRegisters}));
        const unsubscribeReset = Manager.subscribe("registerReset", () => setCPURegisters(initialCPURegisters));

        return () => {
            unsubscribeRegisterUpdate();
            unsubscribeReset();
        };
    }, []);

    useLinkedResizing({
        headerRef,
        elementRef: cpuRegistersRef,
        holderRef: rightGroupRef,
        collisionRefs: { prev: ioDevicesRef, next: ioRegistersRef }
    });
    
    return(
        <div className="cpu-registers" ref={cpuRegistersRef}>
            <MiniHeader
                title="CPU Registers"
                ref={headerRef}
            />

            <div className="cpu-registers-content">
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