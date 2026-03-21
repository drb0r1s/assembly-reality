import { useState, useEffect } from "react";
import DesktopLayout from "./layouts/DesktopLayout";
import MobileLayout from "./layouts/MobileLayout";
import NoHeadersLayout from "./layouts/NoHeadersLayout";
import { useResize } from "./hooks/useResize";
import { useManagerValue } from "./hooks/useManagerValue";
import { Autosave } from "./helpers/Autosave";

const App = () => {
    const [noHeaders, setNoHeaders] = useState(false);
    
    const width = useResize();
    const isLightTheme = useManagerValue("isLightTheme");

    useEffect(() => {
        // No COOP/COEP headers.
        if(!crossOriginIsolated) setNoHeaders(true);

        Autosave.initialize();
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", isLightTheme ? "light" : "dark");
    }, [isLightTheme]);

    return(
        <div id="assembly-reality">
            {noHeaders ? <NoHeadersLayout /> : width >= 900 ? <DesktopLayout /> : <MobileLayout />}
        </div>
    );
}

export default App;