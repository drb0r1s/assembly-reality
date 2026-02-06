import { useEffect, useRef } from "react";
import MobileMenu from "./MobileMenu";
import Memory from "../memory/Memory";
import Hardware from "../hardware/Hardware";

const MobileModal = ({ componentName, setActiveModal }) => {
    const mobileModalRef = useRef(null);
    
    const Components = { Menu: MobileMenu, Memory, Hardware };
    const Component = Components[componentName];

    useEffect(() => {
        if(mobileModalRef.current && componentName) setTimeout(() => { mobileModalRef.current.style.left = "0" }, 10);
    }, [componentName]);

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
            <MobileMenu
                componentName={componentName}
                style={componentName === "Menu" ? {} : { display: "none" }}
                onReturn={disableModal}
            />

            <Memory
                style={componentName === "Memory" ? {} : { display: "none" }}
                onReturn={disableModal}
            />

            <Hardware
                style={componentName === "Hardware" ? {} : { display: "none" }}
                onReturn={disableModal}
            />
        </div>
    );
}

export default MobileModal;