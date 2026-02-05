import { useEffect, useContext } from "react";
import DesktopLayout from "./layouts/DesktopLayout";
import MobileLayout from "./layouts/MobileLayout";
import { GlobalContext } from "./context/GlobalContext";
import { useResize } from "./hooks/useResize";
import { useManagerValue } from "./hooks/useManagerValue";
import { Autosave } from "./helpers/Autosave";
import { Manager } from "./helpers/Manager";

const App = () => {
    const { assembler, assemblerWorker } = useContext(GlobalContext);

    const width = useResize();
    const isLightTheme = useManagerValue("isLightTheme");

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
        <>
            {width >= 900 ? <DesktopLayout /> : <MobileLayout />}
        </>
    );
}

export default App;