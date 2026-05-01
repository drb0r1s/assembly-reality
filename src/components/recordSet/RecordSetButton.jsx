import { Manager } from "../../helpers/Manager";
import { Images } from "../../data/Images";

const RecordSetButton = ({ isExpanded, isRecording, setIsRecording }) => {
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
            className={`record-set-button ${isExpanded ? "record-set-button-expanded" : ""} ${isRecording ? "record-set-button-recording" : ""}`}
            title={isRecording ? "Stop" : "Record"}
            onClick={isRecording ? stopRecording : startRecording}
        >
            {isRecording ? <Images.RecordingIcon className="record-set-button-recording-icon" /> : <Images.RecordIcon className="record-set-button-record-icon" />}
            {isExpanded && <p>{isRecording ? "Recording..." : "Record"}</p>}
        </button>
    );
}

export default RecordSetButton;