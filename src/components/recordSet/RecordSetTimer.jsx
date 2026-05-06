import { useEffect, useRef } from "react";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../helpers/Manager";

const RecordSetTimer = ({ isExpanded }) => {
    const recordingIsActive = useManagerValue("recordingIsActive");
    const recordingSeconds = useManagerValue("recordingSeconds");
    
    const recordSetTimerRef = useRef(null);
    const intervalRef = useRef(null);
    const secondsRef = useRef(recordingSeconds);

    useEffect(() => {
        if(recordingIsActive) {
            setTimeout(() => {
                recordSetTimerRef.current.style.opacity = "1";
                recordSetTimerRef.current.style.top = "0";
            }, 100);

            intervalRef.current = setInterval(() => {
                Manager.set("recordingSeconds", secondsRef.current + 1);
                secondsRef.current += 1;
            }, 1000);
        }
        
        else {
            recordSetTimerRef.current.style.opacity = "";
            recordSetTimerRef.current.style.top = "";

            setTimeout(() => {
                Manager.set("recordingSeconds", 0);
                secondsRef.current = 0;
            }, 300);

            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [recordingIsActive]);

    const displayedMinutes = String(Math.floor(secondsRef.current / 60)).padStart(2, "0");
    const displayedSeconds = String(secondsRef.current % 60).padStart(2, "0");

    return (
        <div className={`record-set-timer ${isExpanded ? "record-set-timer-expanded" : ""}`} ref={recordSetTimerRef}>
            <p>{displayedMinutes}:{displayedSeconds}</p>
        </div>
    );
}

export default RecordSetTimer;