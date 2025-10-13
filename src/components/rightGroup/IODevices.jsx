import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import MiniHeader from "../MiniHeader";
import { useLinkedResizing } from "../../hooks/useLinkedResizing";
import { useResizeObserver } from "../../hooks/useResizeObserver";
import { images } from "../../data/images";

const IODevices = ({ rightGroupRef, ioDevicesRef, cpuRegistersRef, ioRegistersRef }) => {
    const [keyboard, setKeyboard] = useState({ isActive: false, activeCharacter: "" });
    const [lowerSection, setLowerSection] = useState({ ref: null }); // This state has to contain the elements inside the object, under the ref property, because of the way React is updating ref objects.
    
    const headerRef = useRef(null);

    const mainReducer = useSelector(state => state.main);

    const miniDisplayMatrix = Array.from({ length: 2 }, () => Array.from({ length: 16 }, () => ""));
    
    const ioDevicesHeight = useResizeObserver({ elementRef: ioDevicesRef });
    const lowerSectionHeight = useResizeObserver({ elementRef: lowerSection.ref }); // Here we need to take in the consideration a possibility that CPU Registers section can be disabled.

    useLinkedResizing({
        headerRef,
        elementRef: ioDevicesRef,
        holderRef: rightGroupRef,
        collisionRefs: { next: mainReducer.view.cpuRegisters ? cpuRegistersRef : ioRegistersRef, doubleNext: mainReducer.view.cpuRegisters ? ioRegistersRef : { current: null } }
    });

    useEffect(() => {
        const ref = cpuRegistersRef?.current ? cpuRegistersRef : ioRegistersRef;
        setLowerSection({ ref })
    }, [mainReducer.view]);
    
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
                    {miniDisplayMatrix.map((row, rowIndex) => {
                        return <div
                            key={`row-${rowIndex}`}
                            className="io-devices-mini-display-row"
                        >
                            {row.map((column, columnIndex) => {
                                return <p
                                    key={`column-${columnIndex}`}
                                    className="io-devices-mini-display-column"
                                >{column}</p>;
                            })}
                        </div>;
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