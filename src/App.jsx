import { useEffect } from "react";
import DesktopLayout from "./layouts/DesktopLayout";
import MobileLayout from "./layouts/MobileLayout";
import { useResize } from "./hooks/useResize";
import { useManagerValue } from "./hooks/useManagerValue";
import { Autosave } from "./helpers/Autosave";

const App = () => {
    const width = useResize();
    const isLightTheme = useManagerValue("isLightTheme");

    useEffect(Autosave.initialize, []);

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