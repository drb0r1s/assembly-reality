import { useSelector } from "react-redux";
import IODevices from "./IODevices";
import CPURegisters from "./CPURegisters";
import IORegisters from "./IORegisters";

const RightGroup = () => {
    const mainReducer = useSelector(state => state.main);
    
    return(
        <div className="right-group">
            <div className="right-group-content">
                {mainReducer.view.ioDevices && <IODevices />}
                {mainReducer.view.cpuRegisters && <CPURegisters />}
                {mainReducer.view.ioRegisters && <IORegisters />}
            </div>
        </div>
    );
}

export default RightGroup;