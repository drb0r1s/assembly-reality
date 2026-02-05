import { useEffect, useRef } from "react";
import Memory from "../memory/Memory";
import Hardware from "../hardware/Hardware";

const MobileModal = ({ componentName, setActiveModal }) => {
    const mobileModalRef = useRef(null);
    
    const Components = { Memory, Hardware };
    const Component = Components[componentName];

    useEffect(() => {
        if(mobileModalRef.current) setTimeout(() => { mobileModalRef.current.style.left = "0" }, 10);
    }, []);

    function disableModal() {
        if(!mobileModalRef.current) {
            setActiveModal("");
            return;
        }

        mobileModalRef.current.style.left = "";
        setTimeout(() => setActiveModal(""), 300);
    }
    
    return(
        <div className="mobile-modal" ref={mobileModalRef}>
            <Component onReturn={disableModal} />
        </div>
    );
}

export default MobileModal;