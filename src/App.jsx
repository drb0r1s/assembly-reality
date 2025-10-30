import { useEffect, useContext } from "react";
import Header from "./components/header/Header";
import Editor from "./components/editor/Editor";
import Memory from "./components/memory/Memory";
import RightGroup from "./components/rightGroup/RightGroup";
import { GlobalContext } from "./context/GlobalContext";
import { useManagerValue } from "./hooks/useManagerValue";
import { Manager } from "./Manager";

const App = () => {
    const { assembler, assemblerWorker } = useContext(GlobalContext);
    const view = useManagerValue("view");

    useEffect(() => {
        const unsubscribe = Manager.subscribe("reset", () => {
            if(!assemblerWorker) return;
            assemblerWorker.postMessage({ action: "reset" });
        });
        
        return unsubscribe;
    }, [assembler]);

    return(
        <main>
            <Header />

            <div className="display">
                <Editor />
                {view.memory && <Memory />}
                {(view.ioDevices || view.cpuRegisters || view.ioRegisters) && <RightGroup />}
            </div>
        </main>
    );
}

export default App;