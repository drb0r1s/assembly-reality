import { useState } from "react";
import Range from "../Range";

const HeaderDropdownSpeed = () => {
    const [speed, setSpeed] = useState(4);

    const buttons = [4, 1000, 5000, 10000, 20000, 50000];
    
    return(
        <div className="header-dropdown-speed">
            <strong>{speed < 1000 ? `${speed.toFixed(1)} Hz` : `${(speed / 1000).toFixed(2)} kHz`}</strong>
            
            <Range
                value={speed}
                min={4}
                max={50000}
                onDrag={frequency => setSpeed(parseFloat(frequency))}
            />

            <div className="header-dropdown-speed-buttons">
                {buttons.map((button, index) => {
                    return <button
                        key={index}
                        onClick={() => setSpeed(button)}
                    >{button < 1000 ? `${button.toFixed(0)} Hz` : `${(button / 1000).toFixed(0)} kHz`}</button>;
                })}
            </div>
        </div>
    );
}

export default HeaderDropdownSpeed;