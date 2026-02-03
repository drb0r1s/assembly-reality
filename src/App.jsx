import { useEffect, useContext } from "react";
import Header from "./components/header/Header";
import Editor from "./components/editor/Editor";
import Memory from "./components/memory/Memory";
import RightGroup from "./components/rightGroup/RightGroup";
import ExpandedDisplay from "./components/ExpandedDisplay";
import { GlobalContext } from "./context/GlobalContext";
import { useManagerValue } from "./hooks/useManagerValue";
import { Autosave } from "./helpers/Autosave";
import { Manager } from "./helpers/Manager";

const App = () => {
    const { assembler, assemblerWorker } = useContext(GlobalContext);
    
    const isLightTheme = useManagerValue("isLightTheme");
    const view = useManagerValue("view");
    const isDisplayExpanded = useManagerValue("isDisplayExpanded");

    useEffect(Autosave.initialize, []);

    useEffect(() => {
        const unsubscribe = Manager.subscribe("reset", () => {
            if(!assemblerWorker) return;
            
            Manager.sequence(() => {
                Manager.set("isMemoryEmpty", true);
                Manager.set("isAssembled", false);
                Manager.set("isRunning", false);
                Manager.set("isExecuted", false);
            });
            
            assemblerWorker.postMessage({ action: "reset" });
        });
        
        return unsubscribe;
    }, [assembler]);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", isLightTheme ? "light" : "dark");
    }, [isLightTheme]);

    return(
        <main>
            {isDisplayExpanded && <ExpandedDisplay />}

            <Header />

            <div className="workspace">
                <Editor />
                {view.memory && <Memory />}
                {(view.ioDevices || view.cpuRegisters || view.ioRegisters) && <RightGroup />}
            </div>
        </main>
    );
}

export default App;