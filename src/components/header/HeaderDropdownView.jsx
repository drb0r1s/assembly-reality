import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../helpers/Manager";
import { images } from "../../data/images";

const HeaderDropdownView = () => {
    const view = useManagerValue("view");
    const buttons = ["Memory", "I/O Devices", "CPU Registers", "I/O Registers"];

    function getView(button) {
        switch(button) {
            case "Memory": return view.memory;
            case "I/O Devices": return view.ioDevices;
            case "CPU Registers": return view.cpuRegisters;
            case "I/O Registers": return view.ioRegisters;
        }
    }

    function updateView(button) {
        let key = "";
    
        switch(button) {
            case "Memory":
                key = "memory";
                break;
            case "I/O Devices":
                key = "ioDevices";
                break;
            case "CPU Registers":
                key = "cpuRegisters";
                break;
            case "I/O Registers":
                key = "ioRegisters";
                break;
        }
    
        Manager.set("view", {...view, [key]: !view[key]});
    }
    
    return(
        <div className="header-dropdown-view">
            {buttons.map((button, index) => {
                return <button
                    key={index}
                    onClick={() => updateView(button)}
                >
                    <div className="header-dropdown-view-button-left-group">
                        <img src={images.windowIcon} alt="WINDOW" />
                        <p>{button}</p>
                    </div>

                    <img
                        src={images.checkIcon}
                        alt="CHECK"
                        className="header-dropdown-view-check-icon"
                        style={getView(button) ? { opacity: "1" } : {}}
                    />
                </button>;
            })}
        </div>
    );
}

export default HeaderDropdownView;