import { Manager } from "../../helpers/Manager";
import { Images } from "../../data/Images";

const RecordSetButton = ({ isRecording, setIsRecording }) => {
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
            className={`record-set-button ${isRecording ? "record-set-button-recording" : ""}`}
            title={isRecording ? "Stop" : "Record"}
            onClick={isRecording ? stopRecording : startRecording}
        >
            {isRecording ? <Images.RecordingIcon className="record-set-button-recording-icon" /> : <Images.RecordIcon />}
        </button>
    );
}

export default RecordSetButton;