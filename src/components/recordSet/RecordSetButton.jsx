import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../helpers/Manager";
import { Images } from "../../data/Images";

const RecordSetButton = ({ isExpanded, isRecording, setIsRecording }) => {
    const isRunning = useManagerValue("isRunning");
    
    function startRecording() {
        if(!isRunning) return;

        Manager.trigger("pingRecording");
        setIsRecording(true);
    }

    function stopRecording() {
        if(!isRunning) return;

        Manager.trigger("pingRecording");
        setIsRecording(false);
    }
    
    return(
        <button
            className={`record-set-button ${isRecording ? "record-set-button-recording" : ""} ${isExpanded ? "record-set-button-expanded" : ""} ${!isRunning ? "record-set-button-disabled" : ""}`}
            title={isRecording ? "Stop" : "Record"}
            onClick={isRecording ? stopRecording : startRecording}
        >
            {isRecording ? <Images.RecordingIcon className="record-set-button-recording-icon" /> : <Images.RecordIcon className="record-set-button-record-icon" />}
            {isExpanded && <p>{isRecording ? "Recording..." : "Record"}</p>}
        </button>
    );
}

export default RecordSetButton;