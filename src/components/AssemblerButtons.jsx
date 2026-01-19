import { useManagerValue } from "../hooks/useManagerValue";
import { Manager } from "../Manager";
import { images } from "../data/images";
import { headerButtons } from "../data/headerButtons";

const AssemblerButtons = ({ className, isExpanded }) => {
    const isRunning = useManagerValue("isRunning");
    
    function handleButton(button) {
        return Manager.trigger(button);
    }
    
    return (
        <div className={className}>
            {(isExpanded ? headerButtons.expandedAssembler : headerButtons.assembler).map((button, index) => {
                if(button.id === "run") return <button
                    key={index}
                    className="assembler-button"
                    onClick={() => handleButton(isRunning ? "pause" : "run")}
                >
                    <img src={isRunning ? images.pauseIcon : images.runIcon} alt={isRunning ? "PAUSE" : "RUN"} />
                    <p>{isRunning ? "Pause" : "Run"}</p>
                </button>;

                if(button.id === "assembleRun") return <button
                    key={index}
                    className="assembler-button"
                    onClick={() => handleButton(isRunning ? "pause" : "assembleRun")}
                >
                    <img src={isRunning ? images.pauseIcon : images.assembleRunIcon} alt={isRunning ? "PAUSE" : "ASSEMBLE & RUN"} />
                    <p>{isRunning ? "Pause" : "Assemble & Run"}</p>
                </button>;

                return <button
                    key={index}
                    className="assembler-button"
                    onClick={() => handleButton(button.id)}
                >
                    <img src={button.icon} alt={button.title.toUpperCase()} />
                    <p>{button.title}</p>
                </button>;
            })}
        </div>
    );
}

export default AssemblerButtons;