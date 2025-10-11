import MiniHeader from "../MiniHeader";
import IODevices from "./IODevices";
import CPURegisters from "./CPURegisters";

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
            </div>
        </div>
    );
}

export default RightGroup;