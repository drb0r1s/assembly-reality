import HeaderDropdown from "./HeaderDropdown";
import AssemblerButtons from "../AssemblerButtons";
import Version from "../Version";
import { useDropdown } from "../../hooks/useDropdown";
import { useResize } from "../../hooks/useResize";
import { headerButtons } from "../../data/headerButtons";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Images } from "../../data/Images";

const Header = () => {
    const { dropdown, enableDropdown, disableDropdown, dropdownRefs } = useDropdown({ file: false, view: false, speed: false });

    const speed = useManagerValue("speed");
    const isRunning = useManagerValue("isRunning");
    const lockFileDropdown = useManagerValue("lockFileDropdown");

    const width = useResize();

    return(
        <header>
            <div className="header-left-group">
                <Images.ARy className="header-left-group-logo" />

                <div className="header-left-group-divider"></div>
                
                <div className="header-buttons header-dropdown-buttons">
                    {headerButtons.dropdown.map(button => {
                        const { Icon } = button;
                        const key = button.title.toLowerCase();

                        const isDisabled = key === "speed" && isRunning;
                        
                        return <div
                            key={key}
                            className={`header-dropdown-button ${isDisabled ? "header-dropdown-button-disabled" : ""}`}
                            onMouseOver={isDisabled ? () => {} : () => enableDropdown(key)}
                            onMouseLeave={() => disableDropdown(key)}
                        >
                            {((key === "file" && lockFileDropdown) || dropdown[key]) && <HeaderDropdown
                                type={key}
                                ref={el => dropdownRefs.current[key] = el}
                            />}

                            <p>{button.title}</p>
                            {button.title === "Speed" && <span>{speed < 1000 ? `${speed.toFixed(1)} Hz` : `${(speed / 1000).toFixed(2)} kHz`}</span>}
                            <Icon />
                        </div>;
                    })}
                </div>

                <div className="header-left-group-divider"></div>

                <AssemblerButtons className="header-buttons header-assembler-buttons" />
            </div>

            <div className="header-right-group">
                <strong className="header-title">{width < 1100 ? "ARy" : "Assembly Reality"}</strong>
                <Version />
            </div>
        </header>
    );
}

export default Header;