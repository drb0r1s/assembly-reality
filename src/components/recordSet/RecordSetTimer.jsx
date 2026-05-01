import { useEffect, useRef } from "react";

const RecordSetTimer = ({ isExpanded, isRecording, seconds, setSeconds }) => {
    const recordSetTimerRef = useRef(null);
    const intervalRef = useRef(null);
    const secondsRef = useRef(seconds);

    useEffect(() => {
        if(isRecording) {
            setTimeout(() => {
                recordSetTimerRef.current.style.opacity = "1";
                recordSetTimerRef.current.style.top = "0";
            }, 100);

            intervalRef.current = setInterval(() => {
                setSeconds(secondsRef.current + 1);
                secondsRef.current += 1;
            }, 1000);
        }
        
        else {
            recordSetTimerRef.current.style.opacity = "";
            recordSetTimerRef.current.style.top = "";

            setTimeout(() => { setSeconds(0) }, 300);

            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRecording]);

    const displayedMinutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const displayedSeconds = String(seconds % 60).padStart(2, "0");

    return (
        <div className={`record-set-timer ${isExpanded ? "record-set-timer-expanded" : ""}`} ref={recordSetTimerRef}>
            <p>{displayedMinutes}:{displayedSeconds}</p>
        </div>
    );
}

export default RecordSetTimer;