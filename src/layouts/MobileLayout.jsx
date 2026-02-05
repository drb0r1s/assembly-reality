import { Routes, Route } from "react-router-dom";
import Editor from "../components/editor/Editor";
import Memory from "../components/memory/Memory";
import Hardware from "../components/hardware/Hardware";

const MobileLayout = () => {
    return(
        <main>
            <Routes>
                <Route path="/" element={<Editor />} />
                <Route path="/memory" element={<Memory />} />
                <Route path="/hardware" element={<Hardware />} />
            </Routes>
        </main>
    );
}

export default MobileLayout;