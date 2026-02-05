import { Routes, Route } from "react-router-dom";
import Editor from "../components/editor/Editor";
import Memory from "../components/memory/Memory";
import Hardware from "../components/hardware/Hardware";
import MobileNavigation from "../components/MobileNavigation";

const MobileLayout = () => {
    return(
        <main>
            <Routes>
                <Route path="/" element={<Editor />} />
                <Route path="/memory" element={<Memory />} />
                <Route path="/hardware" element={<Hardware />} />
            </Routes>

            <MobileNavigation />
        </main>
    );
}

export default MobileLayout;