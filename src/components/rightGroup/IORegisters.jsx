import { useState, useEffect, useRef, useContext } from "react";
import MiniHeader from "../MiniHeader";
import { GlobalContext } from "../../context/GlobalContext";
import { useLinkedResizing } from "../../hooks/useLinkedResizing";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../Manager";

const IORegisters = ({ rightGroupRef, ioDevicesRef, cpuRegistersRef, ioRegistersRef }) => {
    const { assembler } = useContext(GlobalContext);
    
    const [ioRegisters, setIORegisters] = useState(assembler.ioRegisters.construct());
    
    const headerRef = useRef(null);
    const view = useManagerValue("view");

    useLinkedResizing({
        headerRef,
        elementRef: ioRegistersRef,
        holderRef: rightGroupRef,
        collisionRefs: { prev: view.cpuRegisters ? cpuRegistersRef : ioDevicesRef, doublePrev: view.cpuRegisters ? ioDevicesRef : { current: null } }
    });

    useEffect(() => {
        const unsubscribeIORegisterPing = Manager.subscribe("ioRegisterPing", () => setIORegisters(assembler.ioRegisters.construct()));
        return unsubscribeIORegisterPing;
    }, []);
    
    return(
        <div className="io-registers" ref={ioRegistersRef}>
            <MiniHeader
                title="Input / Output Registers"
                ref={headerRef}
            />

            <div className="io-registers-map">
                <div className="io-registers-map-row io-registers-map-header">
                    <p>Address</p>
                    <p>Name</p>
                    <p>Value</p>
                </div>

                {Object.keys(ioRegisters).map((ioRegister, index) => {
                    const ioRegisterValue = Object.values(ioRegisters)[index];
                    
                    return <div
                        key={index}
                        className="io-registers-map-row"
                    >
                        <p>{index.toString(16).toUpperCase().padStart(4, "0")}</p>
                        <p>{ioRegister}</p>
                        <p>{ioRegisterValue.toString(16).toUpperCase().padStart(4, "0")}</p>
                    </div>;
                })}
            </div>
        </div>
    );
}

export default IORegisters;