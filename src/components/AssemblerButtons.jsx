import { useManagerValue } from "../hooks/useManagerValue";
import { Manager } from "../helpers/Manager";
import { Images } from "../data/Images";

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
        <div className={`assembler-buttons ${className ? className : ""}`}>
            {isExpanded ? <>
                <button
                    className={`assembler-button ${isAssembleRunDisabled ? "assembler-button-disabled" : ""}`}
                    onClick={isAssembleRunDisabled ? () => {} : () => handleButton(isRunning ? "pause" : isMemoryEmpty ? "assembleRun" : "run")}
                >
                    {isRunning ? <Images.PauseIcon className="assembler-button-icon" /> : isMemoryEmpty ? <Images.AssembleRunIcon className="assembler-button-icon" /> : <Images.RunIcon className="assembler-button-icon" />}
                    <p>{isRunning ? "Pause" : isMemoryEmpty ? "Assemble & Run" : "Run"}</p>
                </button>

                <button
                    className={`assembler-button ${isMemoryEmpty ? "assembler-button-disabled" : ""}`}
                    onClick={isMemoryEmpty ? () => {} : () => handleButton("reset")}
                >
                    <Images.ResetIcon className="assembler-button-icon" />
                    <p>Reset</p>
                </button>
            </> : <>
                <button
                    className={`assembler-button ${isAssembleDisabled ? "assembler-button-disabled" : ""}`}
                    onClick={isAssembleDisabled ? () => {} : () => handleButton("assemble")}
                >
                    <Images.AssembleIcon className="assembler-button-icon" />
                    <p>Assemble</p>
                </button>

                <button
                    className={`assembler-button ${isRunDisabled ? "assembler-button-disabled" : ""}`}
                    onClick={isRunDisabled ? () => {} : () => handleButton(isRunning ? "pause" : "run")}
                >
                    {isRunning ? <Images.PauseIcon className="assembler-button-icon" /> : <Images.RunIcon className="assembler-button-icon" />}
                    <p>{isRunning ? "Pause" : "Run"}</p>
                </button>

                <button
                    className={`assembler-button ${isStepDisabled ? "assembler-button-disabled" : ""}`}
                    onClick={isStepDisabled ? () => {} : () => handleButton("step")}
                >
                    <Images.StepIcon className="assembler-button-icon" />
                    <p>Step</p>
                </button>

                <button
                    className={`assembler-button ${isMemoryEmpty ? "assembler-button-disabled" : ""}`}
                    onClick={isMemoryEmpty ? () => {} : () => handleButton("reset")}
                >
                    <Images.ResetIcon className="assembler-button-icon" />
                    <p>Reset</p>
                </button>
            </>}
        </div>
    );
}

export default AssemblerButtons;