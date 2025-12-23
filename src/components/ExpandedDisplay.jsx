import { useEffect, useRef } from "react";
import Display from "./Display";
import { Manager } from "../Manager";
import { images } from "../data/images";

const ExpandedDisplay = () => {
    const expandedDisplayRef = useRef(null);

    useEffect(() => {
        setTimeout(() => { expandedDisplayRef.current.style.opacity = "1" }, 10);
    }, []);
    
    function disabledExpandedDisplay() {
        expandedDisplayRef.current.style.opacity = "";
        setTimeout(() => Manager.set("isDisplayExpanded", false), 300);
    }
    
    return(
        <div className="expanded-display" ref={expandedDisplayRef}>
            <button
                className="expanded-display-x-button"
                onClick={disabledExpandedDisplay}
            >
                <img src={images.xIcon} alt="" />
            </button>

            <Display />
        </div>
    );
}

export default ExpandedDisplay;