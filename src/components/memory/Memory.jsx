import { useState } from "react";
import MemoryMap from "./MemoryMap";

const Memory = () => {
    const [isSplitActive, setIsSplitActive] = useState(false);

    return(
        <div className="memory">
            <div className="memory-header">
                <strong>Memory</strong>
                
                <button
                    className={isSplitActive ? "memory-header-split-button-active" : ""}
                    onClick={() => setIsSplitActive(!isSplitActive)}
                >Split</button>
            </div>

            <div className="memory-map-holder">
                <MemoryMap isSplitActive={isSplitActive} />
                {isSplitActive && <MemoryMap isSplitActive={isSplitActive} />}
            </div>
        </div>
    );
}

export default Memory;