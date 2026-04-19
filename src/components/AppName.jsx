import Version from "./Version";
import { useResize } from "../hooks/useResize";

const AppName = () => {
    const width = useResize();
    
    return(
        <div className="app-name">
            <strong className="app-name-title">{width < 1100 ? "ARy" : "Assembly Reality"}</strong>
            <Version />
        </div>
    );
}

export default AppName;