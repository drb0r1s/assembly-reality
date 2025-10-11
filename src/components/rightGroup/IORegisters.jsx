import { useRef } from "react";
import MiniHeader from "../MiniHeader";
import { registers } from "../../data/IORegisters";

const IORegisters = () => {
    const registersValueRef = useRef({
        "0000": "0000",
        "0001": "0000",
        "0002": "0000",
        "0003": "0000",
        "0004": "0000",
        "0005": "0000",
        "0006": "0000",
        "0007": "0000",
        "0008": "0000",
        "0009": "0000",
        "000A": "0000"
    });
    
    return(
        <div className="io-registers">
            <MiniHeader
                title="Input / Output Registers"
                style={{ cursor: "ns-resize" }}
            />

            <div className="io-registers-map">
                <div className="io-registers-map-row io-registers-map-header">
                    <p>Address</p>
                    <p>Name</p>
                    <p>Value</p>
                </div>

                {registers.map(register => {
                    return <div
                        key={register.address}
                        className="io-registers-map-row"
                    >
                        <p>{register.address}</p>
                        <p>{register.name}</p>
                        <p>{registersValueRef.current[register.address]}</p>
                    </div>;
                })}
            </div>
        </div>
    );
}

export default IORegisters;