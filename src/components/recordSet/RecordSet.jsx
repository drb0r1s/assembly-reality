import { useState } from "react";
import RecordSetButton from "./RecordSetButton";
import RecordSetTimer from "./RecordSetTimer";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../helpers/Manager";

const RecordSet = ({ isExpanded }) => {
    const recording = useManagerValue("recording");
    
    return(
        <div className={`record-set ${isExpanded ? "record-set-expanded" : ""}`}>
            <RecordSetButton
                isExpanded={isExpanded}
                isRecording={recording.isActive}
                setIsRecording={newValue => Manager.set("recording", {...recording, isActive: newValue})}
            />

            <RecordSetTimer
                isExpanded={isExpanded}
                isRecording={recording.isActive}
                seconds={recording.seconds}
                setSeconds={newValue => Manager.set("recording", {...recording, seconds: newValue})}
            />
        </div>
    );
}

export default RecordSet;