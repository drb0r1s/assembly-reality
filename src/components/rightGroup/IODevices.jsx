import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import MiniHeader from "../MiniHeader";
import { useLinkedResizing } from "../../hooks/useLinkedResizing";
import { images } from "../../data/images";

const IODevices = ({ rightGroupRef, ioDevicesRef, cpuRegistersRef, ioRegistersRef }) => {
    const [keyboard, setKeyboard] = useState({ isActive: false, activeCharacter: "" });
    
    const headerRef = useRef(null);

    const mainReducer = useSelector(state => state.main);

    const miniDisplayMatrix = Array.from({ length: 2 }, () => Array.from({ length: 16 }, () => ""));
    
    useLinkedResizing({
        headerRef,
        elementRef: ioDevicesRef,
        holderRef: rightGroupRef,
        collisionRefs: { next: mainReducer.view.cpuRegisters ? cpuRegistersRef : ioRegistersRef, doubleNext: mainReducer.view.cpuRegisters ? ioRegistersRef : { current: null } }
    });

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
    );
}

export default IODevices;