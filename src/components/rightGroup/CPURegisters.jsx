import { useRef } from "react";
import MiniHeader from "../MiniHeader";
import { useExpand } from "../../hooks/useExpand";

const CPURegisters = ({ rightGroupRef, ioDevicesRef, cpuRegistersRef, ioRegistersRef }) => {
    const headerRef = useRef(null);
    
    const registersRef = useRef({
        A: "0000", B: "0000", C: "0000", D: "0000",
        IP: "0000", SP: "0000",
        SR: { M: "0", C: "0", Z: "0", F: "0", H: "0" }
    });

    useExpand({
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
                        <p>{registersRef.current.A}</p>
                    </div>

                    <div className="cpu-registers-row-register">
                        <strong>B</strong>
                        <p>{registersRef.current.B}</p>
                    </div>

                    <div className="cpu-registers-row-register">
                        <strong>C</strong>
                        <p>{registersRef.current.C}</p>
                    </div>

                    <div className="cpu-registers-row-register">
                        <strong>D</strong>
                        <p>{registersRef.current.D}</p>
                    </div>
                </div>

                <div className="cpu-registers-row">
                    <div className="cpu-registers-row-register cpu-ip-register">
                        <strong>IP</strong>
                        <p>{registersRef.current.IP}</p>
                    </div>

                    <div className="cpu-registers-row-register cpu-sp-register">
                        <strong>SP</strong>
                        <p>{registersRef.current.SP}</p>
                    </div>

                    <div className="cpu-registers-row-register">
                        <strong>SR</strong>

                        <div className="cpu-registers-row-sr-values">
                            {Object.keys(registersRef.current.SR).map((key, index) => {
                                const value = Object.values(registersRef.current.SR)[index];

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