import { useState, useEffect } from "react";
import DesktopLayout from "./layouts/DesktopLayout";
import MobileLayout from "./layouts/MobileLayout";
import NoHeadersLayout from "./layouts/NoHeadersLayout";
import Loading from "./components/Loading";
import { useResize } from "./hooks/useResize";
import { useManagerValue } from "./hooks/useManagerValue";
import { Autosave } from "./helpers/Autosave";

const App = () => {
    const [isLoading, setIsLoading] = useState(true); // Explicitly used for crossOriginIsolated validation.
    const [notIsolated, setNotIsolated] = useState(true);

    const width = useResize();
    const theme = useManagerValue("theme");

    useEffect(() => { Autosave.initialize() }, []);

    useEffect(() => {
        setIsLoading(false);
        if(crossOriginIsolated) setNotIsolated(false);
    }, [crossOriginIsolated]);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    return(
        <div id="assembly-reality">
            {isLoading ? <Loading /> : notIsolated ? <NoHeadersLayout /> : width >= 900 ? <DesktopLayout /> : <MobileLayout />}
        </div>
    );
}

export default App;