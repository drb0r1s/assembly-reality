import ThemeDashboardDropdown from "./ThemeDashboardDropdown";
import { useManagerValue } from "../../hooks/useManagerValue";
import { useDropdown } from "../../hooks/useDropdown";
import { Images } from "../../data/Images";

const ThemeDashboard = () => {
    const theme = useManagerValue("theme");
    const { dropdown, enableDropdown, disableDropdown, dropdownRefs } = useDropdown({ theme: false });

    const ThemeIcons = {
        dark: Images.DarkThemeIcon,
        light: Images.LightThemeIcon,
        classic: Images.ClassicThemeIcon,
        ocean: Images.OceanThemeIcon,
        forest: Images.ForestThemeIcon,
        ruby: Images.RubyThemeIcon
    };

    const ThemeIcon = ThemeIcons[theme];
    
    return(
        <div
            className="theme-dashboard"
            onMouseOver={() => enableDropdown("theme")}
            onMouseLeave={() => disableDropdown("theme")}
        >
            {dropdown.theme && <ThemeDashboardDropdown
                ref={el => dropdownRefs.current.theme = el}
            />}
            
            <div className="theme-dashboard-button">
                <div className="theme-dashboard-button-left-group">
                    <ThemeIcon />
                    <p>{theme} Theme</p>
                </div>
            
                <Images.LeftArrowIcon className="theme-dashboard-button-arrow" />
            </div>
        </div>
    );
}

export default ThemeDashboard;