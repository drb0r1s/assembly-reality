import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../helpers/Manager";
import { Images } from "../../data/Images";

const RecordSetButton = ({ isExpanded }) => {
    const isRunning = useManagerValue("isRunning");
    const recordingIsActive = useManagerValue("recordingIsActive");
    
    function startRecording() {
        if(!isRunning) return;

        Manager.sequence(() => {
            Manager.set("recordingIsActive", true);
            Manager.trigger("pingRecording");
        });
    }

    function stopRecording() {
        if(!isRunning) return;

        Manager.sequence(() => {
            Manager.set("recordingIsActive", false);
            Manager.set("recordingSeconds", 0);

            Manager.trigger("pingRecording");
        });
    }
    
    return(
        <button
            className={`record-set-button ${recordingIsActive ? "record-set-button-recording" : ""} ${isExpanded ? "record-set-button-expanded" : ""} ${!isRunning ? "record-set-button-disabled" : ""}`}
            title={recordingIsActive ? "Stop" : "Record"}
            onClick={recordingIsActive ? stopRecording : startRecording}
        >
            {recordingIsActive ? <Images.RecordingIcon className="record-set-button-recording-icon" /> : <Images.RecordIcon className="record-set-button-record-icon" />}
            {isExpanded && <p>{recordingIsActive ? "Recording..." : "Record"}</p>}
        </button>
    );
}

export default RecordSetButton;