import { useEffect, useRef } from "react";
import { useManagerValue } from "../hooks/useManagerValue";
import { images } from "../data/images";

const HighSpeedBlock = () => {
    const highSpeedBlockRef = useRef(null);
    const isHighSpeed = useManagerValue("isHighSpeed");

    useEffect(() => {
        if(!highSpeedBlockRef.current) return;

        if(isHighSpeed) {
            highSpeedBlockRef.current.style.display = "flex";
            setTimeout(() => { highSpeedBlockRef.current.style.opacity = "1" }, 10);
        }

        else {
            highSpeedBlockRef.current.style.opacity = "";
            setTimeout(() => { highSpeedBlockRef.current.style.display = "" }, 300);
        }
    }, [highSpeedBlockRef, isHighSpeed]);
    
    return(
        <div className="high-speed-block" ref={highSpeedBlockRef}>
            <div className="high-speed-block-container">
                <img src={images.visibilityIcon} alt="VISIBILITY" />
                <p>This window is disabled due to high execution speed (over 10kHz).</p>
            </div>
        </div>
    );
}

export default HighSpeedBlock;