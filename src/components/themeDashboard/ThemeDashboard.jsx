import ThemeDashboardDropdown from "./ThemeDashboardDropdown";
import { useManagerValue } from "../../hooks/useManagerValue";
import { useDropdown } from "../../hooks/useDropdown";
import { useResize } from "../../hooks/useResize";
import { Images } from "../../data/Images";

const ThemeDashboard = () => {
    const theme = useManagerValue("theme");

    const { dropdown, enableDropdown, disableDropdown, dropdownRefs } = useDropdown({ theme: false });
    const width = useResize();

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
            {(dropdown.theme || width < 900) && <ThemeDashboardDropdown
                ref={el => dropdownRefs.current.theme = el}
            />}
            
            {width >= 900 && <div className="theme-dashboard-button">
                <div className="theme-dashboard-button-left-group">
                    <ThemeIcon />
                    <p>{theme} Theme</p>
                </div>
            
                <Images.LeftArrowIcon className="theme-dashboard-button-arrow" />
            </div>}
        </div>
    );
}

export default ThemeDashboard;