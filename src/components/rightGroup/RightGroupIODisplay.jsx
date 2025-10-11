import { useState, useEffect } from "react";
import { images } from "../../data/images";

const RightGroupIODevices = () => {
    const [keyboard, setKeyboard] = useState({ isActive: false, activeCharacter: "" });
    
    const miniDisplayMatrix = Array.from({ length: 2 }, () => Array.from({ length: 16 }, () => ""));
    
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
        <div className="right-group-io-devices">
            <canvas></canvas>

            <div className="right-group-io-devices-mini-display">
                {miniDisplayMatrix.map((row, rowIndex) => {
                    return <div
                        key={`row-${rowIndex}`}
                        className="right-group-io-devices-mini-display-row"
                    >
                        {row.map((column, columnIndex) => {
                            return <p
                                key={`column-${columnIndex}`}
                                className="right-group-io-devices-mini-display-column"
                            >{column}</p>;
                        })}
                    </div>;
                })}
            </div>

            <button
                className={`right-group-io-devices-keyboard ${keyboard.isActive ? "right-group-io-devices-keyboard-active" : ""}`}
                onClick={() => setKeyboard(prevKeyboard => { return {...prevKeyboard, isActive: !prevKeyboard.isActive} })}
            >
                <div className="right-group-io-devices-keyboard-left-group">
                    <div className="right-group-io-devices-keyboard-image-holder">
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
                    className="right-group-io-devices-keyboard-key"
                    style={keyboard.activeCharacter ? { opacity: "1" } : {}}
                >{keyboard.activeCharacter}</p>
            </button>
        </div>
    );
}

export default RightGroupIODevices;