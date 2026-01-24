import { useState, useEffect } from "react";
import Range from "../Range";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../helpers/Manager";

const HeaderDropdownSpeed = () => {
    const initialSpeed = useManagerValue("speed");
    const isHighSpeed = useManagerValue("isHighSpeed");

    const [speed, setSpeed] = useState(initialSpeed);

    const buttons = [4, 1000, 5000, 10000, 20000, 50000];

    useEffect(() => {
        if(speed === initialSpeed) return;

        Manager.set("speed", speed);
        
        if(speed >= 10000 && !isHighSpeed) Manager.set("isHighSpeed", true);
        if(speed < 10000 && isHighSpeed) Manager.set("isHighSpeed", false);
    }, [speed]);
    
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