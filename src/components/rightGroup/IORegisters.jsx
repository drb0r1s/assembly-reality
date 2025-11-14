import { useState, useEffect, useRef } from "react";
import MiniHeader from "../MiniHeader";
import { useLinkedResizing } from "../../hooks/useLinkedResizing";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../Manager";

const IORegisters = ({ rightGroupRef, ioDevicesRef, cpuRegistersRef, ioRegistersRef }) => {
    const initialIORegisters = {
        IRQMASK: 0,
        IRQSTATUS: 0,
        IRQEOI: 0,

        TMRPRELOAD: 0,
        TMRCOUNTER: 0,

        KBDSTATUS: 0,
        KBDDATA: 0,

        VIDMODE: 0,
        VIDADDR: 0,
        VIDDATA: 0,

        RNDGEN: 0
    };

    const [ioRegisters, setIORegisters] = useState(initialIORegisters);
    
    const headerRef = useRef(null);
    const view = useManagerValue("view");

    useLinkedResizing({
        headerRef,
        elementRef: ioRegistersRef,
        holderRef: rightGroupRef,
        collisionRefs: { prev: view.cpuRegisters ? cpuRegistersRef : ioDevicesRef, doublePrev: view.cpuRegisters ? ioDevicesRef : { current: null } }
    });

    useEffect(() => {
        const unsubscribeIORegisterUpdate = Manager.subscribe("ioRegisterUpdate", newIORegisters => setIORegisters({...newIORegisters}));
        const unsubscribeIOKeyboardUpdate = Manager.subscribe("ioKeyboardUpdate", newIORegisters => setIORegisters(prevIORegisters => { return {...prevIORegisters, ...newIORegisters} }));
        const unsubscribeReset = Manager.subscribe("ioRegisterReset", () => setIORegisters(initialIORegisters));

        return () => {
            unsubscribeIORegisterUpdate();
            unsubscribeIOKeyboardUpdate();
            unsubscribeReset();
        };
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