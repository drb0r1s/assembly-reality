import { useManagerValue } from "../../hooks/useManagerValue";
import { Autosave } from "../../helpers/Autosave";
import { Manager } from "../../helpers/Manager";
import { Images } from "../../data/Images";

const ThemeDashboardDropdown = ({ ref }) => {
    const theme = useManagerValue("theme");

    const buttons = ["Dark", "Light", "Classic", "Ocean", "Forest", "Ruby"];
    const ButtonIcons = [Images.DarkThemeIcon, Images.LightThemeIcon, Images.ClassicThemeIcon, Images.OceanThemeIcon, Images.ForestThemeIcon, Images.RubyThemeIcon];
    
    function changeTheme(button) {
        const newTheme = button.toLowerCase();

        if(theme === newTheme) return;

        Autosave.setItem("THEME", newTheme);
        Manager.set("theme", newTheme);
    }

    return(
        <div className="theme-dashboard-dropdown" ref={ref}>
            {buttons.map((button, index) => {
                const ButtonIcon = ButtonIcons[index];

                return <button
                    key={index}
                    id={theme === button.toLowerCase() ? "theme-dashboard-dropdown-theme-button" : ""}
                    className={`theme-dashboard-dropdown-${button.toLowerCase()}-button`}
                    onClick={() => changeTheme(button)}
                >
                    <div className="theme-dashboard-dropdown-button-left-group">
                        <ButtonIcon className="theme-dashboard-dropdown-button-icon" />
                        <p>{button}</p>
                    </div>

                    <Images.CheckIcon
                        className="theme-dashboard-dropdown-check-icon"
                        style={theme === button.toLowerCase() ? { opacity: "1" } : {}}
                    />
                </button>;
            })}
        </div>
    );
}

export default ThemeDashboardDropdown;