import { useState } from "react";
import { Manager } from "../helpers/Manager";
import { Images } from "../data/Images";

const RecordButton = () => {
    const [isRecording, setIsRecording] = useState(false);

    function startRecording() {
        //Manager.trigger("pingRecording");
        setIsRecording(true);
    }

    function stopRecording() {
        //Manager.trigger("pingRecording");
        setIsRecording(false);
    }
    
    return(
        <button
            className={`record-button ${isRecording ? "record-button-recording" : ""}`}
            title={isRecording ? "Stop" : "Record"}
            onClick={isRecording ? stopRecording : startRecording}
        >
            {isRecording ? <Images.RecordingIcon className="record-button-recording-icon" /> : <Images.RecordIcon />}
        </button>
    );
}

export default RecordButton;