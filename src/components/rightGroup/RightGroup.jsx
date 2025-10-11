import MiniHeader from "../MiniHeader";
import IODevices from "./IODevices";
import CPURegisters from "./CPURegisters";
import IORegisters from "./IORegisters";

const RightGroup = () => {
    return(
        <div className="right-group">
            <MiniHeader
                title="Input / Output Devices"
                style={{ borderTop: "none" }}
            />

            <div className="right-group-content">
                <IODevices />
                <CPURegisters />
                <IORegisters />
            </div>
        </div>
    );
}

export default RightGroup;