import HeaderDropdownFile from "./HeaderDropdownFile";
import HeaderDropdownView from "./HeaderDropdownView";
import HeaderDropdownSpeed from "./HeaderDropdownSpeed";
import { useManagerValue } from "../../hooks/useManagerValue";

const HeaderDropdown = ({ type, ref }) => {
    const lockFileDropdown = useManagerValue("lockFileDropdown");
    
    return(
        <div className="header-dropdown" ref={ref}>
            {(lockFileDropdown || type === "file") ? <HeaderDropdownFile /> : type === "view" ? <HeaderDropdownView /> : <HeaderDropdownSpeed />}
        </div>
    );
}

export default HeaderDropdown;