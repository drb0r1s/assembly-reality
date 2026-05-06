import { useState, useEffect } from "react";
import RecordSetButton from "./RecordSetButton";
import RecordSetTimer from "./RecordSetTimer";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../helpers/Manager";

const RecordSet = ({ isExpanded }) => {
    const isRunning = useManagerValue("isRunning");

    const recordingIsActive = useManagerValue("recordingIsActive");
    const recordingSeconds = useManagerValue("recordingSeconds");

    useEffect(() => {
        if(!isRunning) Manager.sequence(() => {
            Manager.set("recordingIsActive", false);
            Manager.set("recordingSeconds", 0);
        });
    }, [isRunning]);
    
    return(
        <div className={`record-set ${isExpanded ? "record-set-expanded" : ""}`}>
            <RecordSetButton isExpanded={isExpanded} />
            <RecordSetTimer isExpanded={isExpanded} />
        </div>
    );
}

export default RecordSet;