import { useState } from "react";
import Editor from "../components/editor/Editor";
import MobileModal from "../components/mobile/MobileModal";
import MobileNavigation from "../components/mobile/MobileNavigation";

const MobileLayout = () => {
    const [activeModal, setActiveModal] = useState("");
    
    return(
        <main>
            <MobileModal
                componentName={activeModal}
                setActiveModal={setActiveModal}
            />

            <Editor />
            <MobileNavigation setActiveModal={setActiveModal} />
        </main>
    );
}

export default MobileLayout;