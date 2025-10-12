import { useSelector, useDispatch } from "react-redux";
import { mainActions } from "../../state/reducers/mainSlice";
import { images } from "../../data/images";

const HeaderDropdown = ({ type, ref }) => {
    const mainReducer = useSelector(state => state.main);
    const dispatch = useDispatch();
    
    const dropdownButtons = getDropdownButtons();

    function getDropdownButtons() {
        if(type === "view") return ["Memory", "I/O Devices", "CPU Registers", "I/O Registers"];
        else return ["4Hz", "1kHz", "5kHz", "10kHz", "20kHz", "50kHz"];
    }

    function getView(button) {
        switch(button) {
            case "Memory": return mainReducer.view.memory;
            case "I/O Devices": return mainReducer.view.ioDevices;
            case "CPU Registers": return mainReducer.view.cpuRegisters;
            case "I/O Registers": return mainReducer.view.ioRegisters;
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

        dispatch(mainActions.updateView({...mainReducer.view, [key]: !mainReducer.view[key]}));
    }
    
    return(
        <div className="header-dropdown" ref={ref}>
            {dropdownButtons.map((button, index) => {
                if(type === "view") return <button
                    key={index}
                    onClick={() => updateView(button)}
                >
                    <p>{button}</p>
                    
                    <img
                        src={images.checkIcon}
                        alt="CHECK"
                        style={getView(button) ? { opacity: "1" } : {}}
                    />
                </button>;
                
                return <button
                    key={index}
                >
                    <p>{button}</p>

                    <img
                        src={images.checkIcon}
                        alt="CHECK"
                    />
                </button>;
            })}
        </div>
    );
}

export default HeaderDropdown;