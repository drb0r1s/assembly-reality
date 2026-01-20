import { useManagerValue } from "../hooks/useManagerValue";
import { Manager } from "../Manager";
import { images } from "../data/images";
import { headerButtons } from "../data/headerButtons";

const AssemblerButtons = ({ className, isExpanded }) => {
    const isRunning = useManagerValue("isRunning");
    const isCodeAssembled = useManagerValue("isCodeAssembled");
    
    function handleButton(button) {
        return Manager.trigger(button);
    }
    
    return(
        <div className={`assembler-buttons ${className}`}>
            {isExpanded ? <>
                <button
                    className="assembler-button"
                    onClick={() => handleButton(isRunning ? "pause" : isCodeAssembled ? "run" : "assembleRun")}
                >
                    <img src={isRunning ? images.pauseIcon : isCodeAssembled ? images.runIcon : images.assembleRunIcon} alt={isRunning ? "PAUSE" : isCodeAssembled ? "RUN" : "ASSEMBLE & RUN"} />
                    <p>{isRunning ? "Pause" : isCodeAssembled ? "Run" : "Assemble & Run"}</p>
                </button>

                <button
                    className="assembler-button"
                    onClick={() => handleButton("reset")}
                >
                    <img src={images.resetIcon} alt="RESET" />
                    <p>Reset</p>
                </button>
            </> : <>
                <button
                    className={`assembler-button ${isCodeAssembled ? "assembler-button-disabled" : ""}`}
                    onClick={isCodeAssembled ? () => {} : () => handleButton("assemble")}
                >
                    <img src={images.assembleIcon} alt="ASSEMBLE" />
                    <p>{isCodeAssembled ? "Assembled" : "Assemble"}</p>
                </button>

                <button
                    className="assembler-button"
                    onClick={() => handleButton(isRunning ? "pause" : "run")}
                >
                    <img src={isRunning ? images.pauseIcon : images.runIcon} alt={isRunning ? "PAUSE" : "RUN"} />
                    <p>{isRunning ? "Pause" : "Run"}</p>
                </button>

                <button
                    className="assembler-button"
                    onClick={() => handleButton("step")}
                >
                    <img src={images.stepIcon} alt="STEP" />
                    <p>Step</p>
                </button>

                <button
                    className="assembler-button"
                    onClick={() => handleButton("reset")}
                >
                    <img src={images.resetIcon} alt="RESET" />
                    <p>Reset</p>
                </button>
            </>}
        </div>
    );
}

export default AssemblerButtons;