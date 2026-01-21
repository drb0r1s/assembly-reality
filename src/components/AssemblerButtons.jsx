import { useManagerValue } from "../hooks/useManagerValue";
import { Manager } from "../Manager";
import { images } from "../data/images";

const AssemblerButtons = ({ className, isExpanded }) => {
    const isRunning = useManagerValue("isRunning");

    const isCodeEmpty = useManagerValue("isCodeEmpty");
    const isCodeAssembled = useManagerValue("isCodeAssembled");

    const isAssembleDisabled = isCodeEmpty || isCodeAssembled;
    const isAssembleRunDisabled = !isRunning && isCodeEmpty;
    
    function handleButton(button) {
        return Manager.trigger(button);
    }
    
    return(
        <div className={`assembler-buttons ${className}`}>
            {isExpanded ? <>
                <button
                    className={`assembler-button ${isAssembleRunDisabled ? "assembler-button-disabled" : ""}`}
                    onClick={isAssembleRunDisabled ? () => {} : () => handleButton(isRunning ? "pause" : isCodeAssembled ? "run" : "assembleRun")}
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
                    className={`assembler-button ${isAssembleDisabled ? "assembler-button-disabled" : ""}`}
                    onClick={isAssembleDisabled ? () => {} : () => handleButton("assemble")}
                >
                    <img src={images.assembleIcon} alt="ASSEMBLE" />
                    <p>Assemble</p>
                </button>

                <button
                    className="assembler-button"
                    onClick={() => handleButton(isRunning ? "pause" : "run")}
                >
                    <img src={isRunning ? images.pauseIcon : images.runIcon} alt={isRunning ? "PAUSE" : "RUN"} />
                    <p>{isRunning ? "Pause" : "Run"}</p>
                </button>

                <button
                    className={`assembler-button ${isRunning ? "assembler-button-disabled" : ""}`}
                    onClick={isRunning ? () => {} : () => handleButton("step")}
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