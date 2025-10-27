import { useState, useEffect, useRef } from "react";
import MiniHeader from "../MiniHeader";
import { useLinkedResizing } from "../../hooks/useLinkedResizing";
import { Manager } from "../../Manager";

const CPURegisters = ({ rightGroupRef, ioDevicesRef, cpuRegistersRef, ioRegistersRef, assembler }) => {
    const [registers, setRegisters] = useState({
        A: "0000", B: "0000", C: "0000", D: "0000",
        IP: "0000", SP: "0000",
        SR: { M: "0", C: "0", Z: "0", F: "0", H: "0" }
    });
    
    const headerRef = useRef(null);

    useEffect(() => {
        const unsubscribe = Manager.subscribe("registerUpdate", newRegisters => setRegisters(newRegisters));
        return unsubscribe;
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
                        <p>{registers.A}</p>
                    </div>

                    <div className="cpu-registers-row-register">
                        <strong>B</strong>
                        <p>{registers.B}</p>
                    </div>

                    <div className="cpu-registers-row-register">
                        <strong>C</strong>
                        <p>{registers.C}</p>
                    </div>

                    <div className="cpu-registers-row-register">
                        <strong>D</strong>
                        <p>{registers.D}</p>
                    </div>
                </div>

                <div className="cpu-registers-row">
                    <div className="cpu-registers-row-register cpu-ip-register">
                        <strong>IP</strong>
                        <p>{registers.IP}</p>
                    </div>

                    <div className="cpu-registers-row-register cpu-sp-register">
                        <strong>SP</strong>
                        <p>{registers.SP}</p>
                    </div>

                    <div className="cpu-registers-row-register">
                        <strong>SR</strong>

                        <div className="cpu-registers-row-sr-values">
                            {Object.keys(registers.SR).map((key, index) => {
                                const value = Object.values(registers.SR)[index];

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