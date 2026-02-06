import Switch from "./Switch";
import { useManagerValue } from "../hooks/useManagerValue";
import { Autosave } from "../helpers/Autosave";
import { Manager } from "../helpers/Manager";
import { Images } from "../data/Images";

const LightThemeButton = () => {
    const isLightTheme = useManagerValue("isLightTheme");
    
    return(
        <button
            className="light-theme-button"
            onClick={() => {
                Autosave.setItem("IS_LIGHT_THEME", !isLightTheme);
                Manager.set("isLightTheme", !isLightTheme);
            }}
        >
            <div className="light-theme-button-left-group">
                <Images.ThemeIcon />
                <p>Light Theme</p>
            </div>
        
            <Switch isActive={isLightTheme} />
        </button>
    );
}

export default LightThemeButton;