import { useRef } from "react";
import DraggableHeader from "../DraggableHeader";
import Display from "../Display";
import { useLinkedResizing } from "../../hooks/useLinkedResizing";
import { useLinkedResizeObserver } from "../../hooks/useLinkedResizeObserver";
import { Manager } from "../../helpers/Manager";
import { Images } from "../../data/Images";

const IODevices = ({ rightGroupRef, elements, allElementRefs }) => {
    const headerRef = useRef(null);

    useLinkedResizing({
        headerRef,
        elementRefs: elements.refs,
        targetIndex: elements.getOrder("ioDevices"),
        holderRef: rightGroupRef,
        conditional: false
    });

    const displayHeight = useLinkedResizeObserver({ elements, elementName: "ioDevices" });

    return(
        <div className="io-devices" ref={allElementRefs[0]}>
            <DraggableHeader
                title="Input / Output Devices"
                ref={headerRef}
            />

            <button
                className="io-devices-expand-button"
                onClick={() => Manager.set("isDisplayExpanded", true)}
            >
                <Images.ExpandIcon />
            </button>
            
            <Display
                style={{ height: `${displayHeight}px` }}
            />
        </div>
    );
}

export default IODevices;