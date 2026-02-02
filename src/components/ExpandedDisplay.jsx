import { useEffect, useRef } from "react";
import Display from "./Display";
import { Manager } from "../helpers/Manager";
import { Images } from "../data/Images";

const ExpandedDisplay = () => {
    const expandedDisplayRef = useRef(null);

    useEffect(() => {
        setTimeout(() => { expandedDisplayRef.current.style.opacity = "1" }, 10);

        const disableExpandedDisplayOnKeydown = e => {
            if(e.key === "Escape") disableExpandedDisplay();
        }

        window.addEventListener("keydown", disableExpandedDisplayOnKeydown);
        return () => window.removeEventListener("keydown", disableExpandedDisplayOnKeydown);
    }, []);
    
    function disableExpandedDisplay() {
        expandedDisplayRef.current.style.opacity = "";
        setTimeout(() => Manager.set("isDisplayExpanded", false), 300);
    }
    
    return(
        <div className="expanded-display" ref={expandedDisplayRef}>
            <button
                className="expanded-display-x-button"
                onClick={disableExpandedDisplay}
            >
                <Images.XIcon />
            </button>

            <Display isExpanded={true} />
        </div>
    );
}

export default ExpandedDisplay;