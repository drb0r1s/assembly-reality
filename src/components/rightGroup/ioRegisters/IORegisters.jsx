import { useState, useEffect, useRef, useContext } from "react";
import DraggableHeader from "../../DraggableHeader";
import IORegister from "./IORegister";
import { GlobalContext } from "../../../context/GlobalContext";
import { useLinkedResizing } from "../../../hooks/useLinkedResizing";
import { useLinkedResizeObserver } from "../../../hooks/useLinkedResizeObserver";
import { Manager } from "../../../helpers/Manager";

const IORegisters = ({ rightGroupRef, elements, allElementRefs }) => {
    const { assembler } = useContext(GlobalContext);
    
    const [ioRegisters, setIORegisters] = useState(assembler.ioRegisters.construct());
    
    const headerRef = useRef(null);

    useLinkedResizing({
        headerRef,
        elementRefs: elements.refs,
        targetIndex: elements.getOrder("ioRegisters"),
        holderRef: rightGroupRef,
        conditional: false
    });

    const displayHeight = useLinkedResizeObserver({ elements, elementName: "ioRegisters" });

    useEffect(() => {
        // TMRCOUNTER will be updated through the update system.
        const unsubscribeIORegistersPing = Manager.subscribe("ioRegistersPing", () => setIORegisters(prevIORegisters => { return {
            ...assembler.ioRegisters.construct(),
            TMRCOUNTER: prevIORegisters.TMRCOUNTER,
            VIDMODE: prevIORegisters.VIDMODE,
            VIDADDR: prevIORegisters.VIDADDR,
            VIDDATA: prevIORegisters.VIDDATA,
            RNDGEN: prevIORegisters.RNDGEN
        }}));

        const unsubscribeIORegistersSlowPing = Manager.subscribe("ioRegistersSlowPing", () => setIORegisters(prevIORegisters => { return {
            ...prevIORegisters,
            TMRCOUNTER: assembler.ioRegisters.getValue("TMRCOUNTER"),
            VIDMODE: assembler.ioRegisters.getValue("VIDMODE"),
            VIDADDR: assembler.ioRegisters.getValue("VIDADDR"),
            VIDDATA: assembler.ioRegisters.getValue("VIDDATA"),
            RNDGEN: assembler.ioRegisters.getValue("RNDGEN")
        }}));

        return () => {
            unsubscribeIORegistersPing();
            unsubscribeIORegistersSlowPing();
        };
    }, []);
    
    return(
        <div className="io-registers" ref={allElementRefs[2]}>
            <DraggableHeader
                title="Input / Output Registers"
                ref={headerRef}
            />

            <div
                className="io-registers-map"
                style={{ height: `${displayHeight}px` }}
            >
                <div className="io-register io-registers-map-header">
                    <p>Address</p>
                    <p>Name</p>
                    <p>Value</p>
                </div>

                {Object.entries(ioRegisters).map(([name, value], index) => {                    
                    return <IORegister
                        key={name}
                        name={name}
                        value={value}
                        index={index}
                    />;
                })}
            </div>
        </div>
    );
}

export default IORegisters;