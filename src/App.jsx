import { useEffect, useContext } from "react";
import Header from "./components/header/Header";
import Editor from "./components/editor/Editor";
import Memory from "./components/memory/Memory";
import RightGroup from "./components/rightGroup/RightGroup";
import ExpandedDisplay from "./components/ExpandedDisplay";
import { GlobalContext } from "./context/GlobalContext";
import { useManagerValue } from "./hooks/useManagerValue";
import { Manager } from "./helpers/Manager";

const App = () => {
    const { assembler, assemblerWorker } = useContext(GlobalContext);
    
    const view = useManagerValue("view");
    const isDisplayExpanded = useManagerValue("isDisplayExpanded");

    useEffect(() => {
        const unsubscribe = Manager.subscribe("reset", () => {
            if(!assemblerWorker) return;
            
            Manager.set("isCodeAssembled", false);
            assemblerWorker.postMessage({ action: "reset" });
        });
        
        return unsubscribe;
    }, [assembler]);

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