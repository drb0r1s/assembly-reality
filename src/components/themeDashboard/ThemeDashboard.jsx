import ThemeDashboardDropdown from "./ThemeDashboardDropdown";
import { useDropdown } from "../../hooks/useDropdown";
import { Images } from "../../data/Images";

const ThemeDashboard = () => {
    const { dropdown, enableDropdown, disableDropdown, dropdownRefs } = useDropdown({ theme: false });
    
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
                    <Images.ThemeIcon />
                    <p>Select Theme</p>
                </div>
            
                <Images.LeftArrowIcon className="theme-dashboard-button-arrow" />
            </div>
        </div>
    );
}

export default ThemeDashboard;