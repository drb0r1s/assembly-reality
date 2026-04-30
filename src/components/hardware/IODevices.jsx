import { useRef } from "react";
import DraggableHeader from "../DraggableHeader";
import Display from "../Display";
import RecordButton from "../RecordButton";
import { useResize } from "../../hooks/useResize";
import { useLinkedResizing } from "../../hooks/useLinkedResizing";
import { useLinkedResizeObserver } from "../../hooks/useLinkedResizeObserver";
import { Manager } from "../../helpers/Manager";
import { Images } from "../../data/Images";

const IODevices = ({ hardwareRef, elements, allElementRefs }) => {
    const headerRef = useRef(null);

    const width = useResize();

    useLinkedResizing({
        headerRef,
        elementRefs: elements.refs,
        targetIndex: elements.getOrder("ioDevices"),
        holderRef: hardwareRef,
        conditional: false
    });

    const displayHeight = useLinkedResizeObserver({ elements, elementName: "ioDevices" });

    return(
        <div className="io-devices" ref={allElementRefs[0]}>
            <DraggableHeader
                title="Input / Output Devices"
                iconName="IODevicesIcon"
                ref={headerRef}
            />

            <div className="io-devices-buttons">
                {width >= 900 && <button
                    className="io-devices-button"
                    title="Expand"
                    onClick={() => Manager.set("isDisplayExpanded", true)}
                >
                    <Images.ExpandIcon />
                </button>}

                <RecordButton />
            </div>
            
            <Display
                style={{ height: `${displayHeight}px` }}
            />
        </div>
    );
}

export default IODevices;