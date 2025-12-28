import HeaderDropdownFile from "./HeaderDropdownFile";
import HeaderDropdownView from "./HeaderDropdownView";
import HeaderDropdownSpeed from "./HeaderDropdownSpeed";

const HeaderDropdown = ({ type, ref }) => {
    return(
        <div className="header-dropdown" ref={ref}>
            {type === "file" ? <HeaderDropdownFile /> : type === "view" ? <HeaderDropdownView /> : <HeaderDropdownSpeed />}
        </div>
    );
}

export default HeaderDropdown;