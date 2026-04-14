import Header from "../components/header/Header";
import Editor from "../components/editor/Editor";
import Memory from "../components/memory/Memory";
import Hardware from "../components/hardware/Hardware";
import ExpandedDisplay from "../components/ExpandedDisplay";
import { useResize } from "../hooks/useResize";
import { useManagerValue } from "../hooks/useManagerValue";

const DesktopLayout = () => {
    const width = useResize();

    const view = useManagerValue("view");
    const isDisplayExpanded = useManagerValue("isDisplayExpanded");

    const hardwareExistence = width >= 1300 ? (view.ioDevices || view.cpuRegisters || view.ioRegisters) : (view.memory || view.ioDevices || view.cpuRegisters || view.ioRegisters);
    
    return(
        <main>
            {isDisplayExpanded && <ExpandedDisplay />}

            <Header />

            <div className="workspace">
                <Editor />
                {width >= 1300 && view.memory && <Memory />}
                {hardwareExistence && <Hardware />}
            </div>
        </main>
    );
}

export default DesktopLayout;