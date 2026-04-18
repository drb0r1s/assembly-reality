import { useManagerValue } from "../../hooks/useManagerValue";
import { Autosave } from "../../helpers/Autosave";
import { Manager } from "../../helpers/Manager";
import { Images } from "../../data/Images";

const ThemeDashboardDropdown = ({ ref }) => {
    const theme = useManagerValue("theme");

    const buttons = ["Dark", "Light", "Classic", "Ocean", "Forest", "Ruby"];
    const ButtonIcons = [Images.DarkThemeIcon, Images.LightThemeIcon, Images.ClassicThemeIcon, Images.OceanThemeIcon, Images.ForestThemeIcon, Images.RubyThemeIcon];
    
    return(
        <div className="theme-dashboard-dropdown" ref={ref}>
            {buttons.map((button, index) => {
                const ButtonIcon = ButtonIcons[index];

                return <button
                    key={index}
                    onClick={() => {
                        Autosave.setItem("THEME", button.toLowerCase());
                        Manager.set("theme", button.toLowerCase());
                    }}
                >
                    <div className="header-dropdown-view-button-left-group">
                        <ButtonIcon />
                        <p>{button}</p>
                    </div>

                    <Images.CheckIcon
                        className="header-dropdown-view-check-icon"
                        style={theme === button.toLowerCase() ? { opacity: "1" } : {}}
                    />
                </button>;
            })}
        </div>
    );
}

export default ThemeDashboardDropdown;