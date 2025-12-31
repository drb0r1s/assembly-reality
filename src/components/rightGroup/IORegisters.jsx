import { useState, useEffect, useRef, useContext } from "react";
import DraggableHeader from "../DraggableHeader";
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
        // IMPORTANT: assembler.loadFrame() is too fast for TMRCOUNTER.
        // TMRCOUNTER will be updated through the update system.
        const unsubscribeIORegistersPing = Manager.subscribe("ioRegistersPing", () => setIORegisters(prevIORegisters => { return {
            ...assembler.ioRegisters.construct(),
            TMRCOUNTER: prevIORegisters.TMRCOUNTER
        }}));

        const unsubscribeIORegistersTimerPing = Manager.subscribe("ioRegistersTimerPing", () => setIORegisters(prevIORegisters => { return {
            ...prevIORegisters,
            TMRCOUNTER: assembler.ioRegisters.getValue("TMRCOUNTER")
        }}));

        return () => {
            unsubscribeIORegistersPing();
            unsubscribeIORegistersTimerPing();
        };
    }, []);
    
    return(
        <div className="io-registers" ref={ioRegistersRef}>
            <DraggableHeader
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