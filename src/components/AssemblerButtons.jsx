import { useManagerValue } from "../hooks/useManagerValue";
import { Manager } from "../helpers/Manager";
import { images } from "../data/images";

const AssemblerButtons = ({ className, isExpanded }) => {
    const isCodeEmpty = useManagerValue("isCodeEmpty");
    const isMemoryEmpty = useManagerValue("isMemoryEmpty");

    const isAssembled = useManagerValue("isAssembled");
    const isRunning = useManagerValue("isRunning");
    const isExecuted = useManagerValue("isExecuted");

    const isAssembleDisabled = isCodeEmpty || isAssembled || isRunning;
    const isAssembleRunDisabled = (isCodeEmpty && isMemoryEmpty) || isExecuted;

    const isRunDisabled = isMemoryEmpty || isExecuted;
    const isStepDisabled = isMemoryEmpty || isRunning || isExecuted;
    
    function handleButton(button) {
        return Manager.trigger(button);
    }
    
    return(
        <div className={`assembler-buttons ${className}`}>
            {isExpanded ? <>
                <button
                    className={`assembler-button ${isAssembleRunDisabled ? "assembler-button-disabled" : ""}`}
                    onClick={isAssembleRunDisabled ? () => {} : () => handleButton(isRunning ? "pause" : isMemoryEmpty ? "assembleRun" : "run")}
                >
                    <img src={isRunning ? images.pauseIcon : isMemoryEmpty ? images.assembleRunIcon : images.runIcon} alt={isRunning ? "PAUSE" : isMemoryEmpty ? "ASSEMBLE & RUN" : "RUN"} />
                    <p>{isRunning ? "Pause" : isMemoryEmpty ? "Assemble & Run" : "Run"}</p>
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
                    className={`assembler-button ${isRunDisabled ? "assembler-button-disabled" : ""}`}
                    onClick={isRunDisabled ? () => {} : () => handleButton(isRunning ? "pause" : "run")}
                >
                    <img src={isRunning ? images.pauseIcon : images.runIcon} alt={isRunning ? "PAUSE" : "RUN"} />
                    <p>{isRunning ? "Pause" : "Run"}</p>
                </button>

                <button
                    className={`assembler-button ${isStepDisabled ? "assembler-button-disabled" : ""}`}
                    onClick={isStepDisabled ? () => {} : () => handleButton("step")}
                >
                    <img src={images.stepIcon} alt="STEP" />
                    <p>Step</p>
                </button>

                <button
                    className={`assembler-button ${isMemoryEmpty ? "assembler-button-disabled" : ""}`}
                    onClick={isMemoryEmpty ? () => {} : () => handleButton("reset")}
                >
                    <img src={images.resetIcon} alt="RESET" />
                    <p>Reset</p>
                </button>
            </>}
        </div>
    );
}

export default AssemblerButtons;