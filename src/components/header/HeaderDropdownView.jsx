import Switch from "../Switch";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Autosave } from "../../helpers/Autosave";
import { Manager } from "../../helpers/Manager";
import { Images } from "../../data/Images";

const HeaderDropdownView = () => {
    const isLightTheme = useManagerValue("isLightTheme");
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
            <button
                className="header-dropdown-view-theme-button"
                onClick={() => {
                    Autosave.setItem("IS_LIGHT_THEME", !isLightTheme);
                    Manager.set("isLightTheme", !isLightTheme);
                }}
            >
                <div className="header-dropdown-view-theme-button-left-group">
                    <Images.ThemeIcon />
                    <p>Light Theme</p>
                </div>

                <Switch isActive={isLightTheme} />
            </button>

            <div className="header-dropdown-view-divider"></div>

            <div className="header-dropdown-view-sections">
                {buttons.map((button, index) => {
                    return <button
                        key={index}
                        onClick={() => updateView(button)}
                    >
                        <div className="header-dropdown-view-button-left-group">
                            <Images.WindowIcon />
                            <p>{button}</p>
                        </div>

                        <Images.CheckIcon
                            className="header-dropdown-view-check-icon"
                            style={getView(button) ? { opacity: "1" } : {}}
                        />
                    </button>;
                })}
            </div>
        </div>
    );
}

export default HeaderDropdownView;