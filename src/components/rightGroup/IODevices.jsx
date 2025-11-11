import { useState, useEffect, useRef } from "react";
import MiniHeader from "../MiniHeader";
import { useLinkedResizing } from "../../hooks/useLinkedResizing";
import { useResizeObserver } from "../../hooks/useResizeObserver";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../Manager";
import { images } from "../../data/images";

const IODevices = ({ rightGroupRef, ioDevicesRef, cpuRegistersRef, ioRegistersRef }) => {
    const [display, setDisplay] = useState(new Uint16Array(32));
    const [keyboard, setKeyboard] = useState({ isActive: false, activeCharacter: "" });
    const [lowerSection, setLowerSection] = useState({ ref: null }); // This state has to contain the elements inside the object, under the ref property, because of the way React is updating ref objects.
    
    const headerRef = useRef(null);

    const view = useManagerValue("view");
    
    const ioDevicesHeight = useResizeObserver({ elementRef: ioDevicesRef });
    const lowerSectionHeight = useResizeObserver({ elementRef: lowerSection.ref }); // Here we need to take in the consideration a possibility that CPU Registers section can be disabled.

    useLinkedResizing({
        headerRef,
        elementRef: ioDevicesRef,
        holderRef: rightGroupRef,
        collisionRefs: { next: view.cpuRegisters ? cpuRegistersRef : ioRegistersRef, doubleNext: view.cpuRegisters ? ioRegistersRef : { current: null } }
    });

    useEffect(() => {
        const unsubscribeDisplayUpdate = Manager.subscribe("displayUpdate", newDislay => setDisplay([...newDislay]));
        const unsubscribeReset = Manager.subscribe("displayReset", () => setDisplay(new Uint16Array(32)));
        
        return () => {
            unsubscribeDisplayUpdate();
            unsubscribeReset();
        };
    }, []);

    useEffect(() => {
        const ref = cpuRegistersRef?.current ? cpuRegistersRef : ioRegistersRef;
        setLowerSection({ ref })
    }, [view]);
    
    useEffect(() => {
        const handleKeydown = e => {
            setKeyboard(prevKeyboard => { return {...prevKeyboard, activeCharacter: e.key} });
        }

        const handleKeyup = () => {
            setKeyboard(prevKeyboard => { return {...prevKeyboard, activeCharacter: ""} });
        }

        if(keyboard.isActive) {
            window.addEventListener("keydown", handleKeydown);
            window.addEventListener("keyup", handleKeyup);
        }

        return () => {
            window.removeEventListener("keydown", handleKeydown);
            window.removeEventListener("keyup", handleKeyup);
        }
    }, [keyboard.isActive]);

    return(
        <div className="io-devices" ref={ioDevicesRef}>
            <MiniHeader
                title="Input / Output Devices"
                ref={headerRef}
            />
            
            <div
                className="io-devices-content"
                style={{ height: `${ioDevicesHeight - lowerSectionHeight - 27}px` }} // 27px (header height)
            >
                <div className="io-devices-canvas-holder">
                    <canvas></canvas>
                    <strong>Assembly Simulator</strong>
                </div>

                <div className="io-devices-mini-display">
                    {[...display].map((element, index) => {
                        return <p
                            key={index}
                            className="io-devices-mini-display-element"
                        >{element !== 0 ? String.fromCharCode(element) : ""}</p>;
                    })}
                </div>

                <button
                    className={`io-devices-keyboard ${keyboard.isActive ? "io-devices-keyboard-active" : ""}`}
                    onClick={() => setKeyboard(prevKeyboard => { return {...prevKeyboard, isActive: !prevKeyboard.isActive} })}
                >
                    <div className="io-devices-keyboard-left-group">
                        <div className="io-devices-keyboard-image-holder">
                            <img
                                src={images.keyboardIcon}
                                alt="KEYBOARD"
                                style={keyboard.isActive ? { opacity: "0" } : {}}
                            />
                            
                            <img
                                src={images.keyboardBlueIcon}
                                alt="KEYBOARD"
                                style={keyboard.isActive ? { opacity: "1" } : {}}
                            />
                        </div>

                        <p>Keyboard</p>
                    </div>

                    <p
                        className="io-devices-keyboard-key"
                        style={keyboard.activeCharacter ? { opacity: "1" } : {}}
                    >{keyboard.activeCharacter}</p>
                </button>
            </div>
        </div>
    );
}

export default IODevices;