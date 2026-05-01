import { useState } from "react";
import RecordSetButton from "./RecordSetButton";
import RecordSetTimer from "./RecordSetTimer";

const RecordSet = () => {
    const [isRecording, setIsRecording] = useState(false);
    
    return(
        <div className="record-set">
            <RecordSetButton
                isRecording={isRecording}
                setIsRecording={setIsRecording}
            />

            <RecordSetTimer isRecording={isRecording} />
        </div>
    );
}

export default RecordSet;