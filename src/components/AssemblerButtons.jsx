import { useManagerValue } from "../hooks/useManagerValue";
import { Manager } from "../Manager";
import { images } from "../data/images";
import { headerButtons } from "../data/headerButtons";

const AssemblerButtons = ({ className }) => {
    const isRunning = useManagerValue("isRunning");
    
    function handleButton(button) {
        return Manager.trigger(button);
    }
    
    return (
        <div className={className}>
            {headerButtons.regular.map((button, index) => {
                if(button.title === "Run") return <button
                    key={index}
                    className="assembler-button"
                    onClick={() => handleButton(isRunning ? "pause" : "run")}
                >
                    <img src={isRunning ? images.pauseIcon : images.runIcon} alt={isRunning ? "PAUSE" : "RUN"} />
                    <p>{isRunning ? "Pause" : "Run"}</p>
                </button>;

                return <button
                    key={index}
                    className="assembler-button"
                    onClick={() => handleButton(button.title.toLowerCase())}
                >
                    <img src={button.icon} alt={button.title.toUpperCase()} />
                    <p>{button.title}</p>
                </button>;
            })}
        </div>
    );
}

export default AssemblerButtons;