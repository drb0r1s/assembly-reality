import { useState, useEffect, useRef, useMemo } from "react";
import DraggableHeader from "../DraggableHeader";
import Display from "../Display";
import { useLinkedResizing } from "../../hooks/useLinkedResizing";
import { useResizeObserver } from "../../hooks/useResizeObserver";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../helpers/Manager";
import { images } from "../../data/images";

const IODevices = ({ rightGroupRef, ioDevicesRef, cpuRegistersRef, ioRegistersRef }) => {
    const [lowerSection, setLowerSection] = useState({ ref: null }); // This state has to contain the elements inside the object, under the ref property, because of the way React is updating ref objects.
    
    const headerRef = useRef(null);
    const view = useManagerValue("view");

    const ioDevicesHeight = useResizeObserver({ elementRef: ioDevicesRef });
    const lowerSectionHeight = useResizeObserver({ elementRef: lowerSection.ref }); // Here we need to take in the consideration a possibility that CPU Registers section can be disabled.

    const displayHeight = useMemo(() => ioDevicesHeight - lowerSectionHeight - 27, [ioDevicesHeight, lowerSectionHeight]);

    useLinkedResizing({
        headerRef,
        elementRef: ioDevicesRef,
        holderRef: rightGroupRef,
        collisionRefs: { next: view.cpuRegisters ? cpuRegistersRef : ioRegistersRef, doubleNext: view.cpuRegisters ? ioRegistersRef : { current: null } }
    });

    useEffect(() => {
        const ref = cpuRegistersRef?.current ? cpuRegistersRef : ioRegistersRef;
        setLowerSection({ ref })
    }, [view.cpuRegisters]);

    return(
        <div className="io-devices" ref={ioDevicesRef}>
            <DraggableHeader
                title="Input / Output Devices"
                ref={headerRef}
            />

            <button
                className="io-devices-expand-button"
                onClick={() => Manager.set("isDisplayExpanded", true)}
            >
                <img src={images.expandIcon} alt="EXPAND" />
            </button>
            
            <Display
                style={{ height: `${displayHeight}px` }} // 27px (header height)
            />
        </div>
    );
}

export default IODevices;