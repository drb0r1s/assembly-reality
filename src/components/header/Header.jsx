import HeaderDropdown from "./HeaderDropdown";
import AssemblerButtons from "../AssemblerButtons";
import { useDropdown } from "../../hooks/useDropdown";
import { headerButtons } from "../../data/headerButtons";
import { useManagerValue } from "../../hooks/useManagerValue";

const Header = () => {
    const { dropdown, enableDropdown, disableDropdown, dropdownRefs } = useDropdown({ view: false, speed: false });

    const speed = useManagerValue("speed");

    return(
        <header>
            <div className="header-left-group">
                <div className="header-buttons header-dropdown-buttons">
                    {headerButtons.dropdown.map(button => {
                        const key = button.title.toLowerCase();
                        
                        return <div
                            key={key}
                            className="header-dropdown-button"
                            onMouseOver={() => enableDropdown(key)}
                            onMouseLeave={() => disableDropdown(key)}
                        >
                            {dropdown[key] && <HeaderDropdown
                                type={key}
                                ref={el => dropdownRefs.current[key] = el}
                            />}

                            <p>{button.title}</p>
                            {button.title === "Speed" && <span>{speed < 1000 ? `${speed.toFixed(1)} Hz` : `${(speed / 1000).toFixed(2)} kHz`}</span>}
                            <img src={button.icon} alt={button.title.toUpperCase()} />
                        </div>;
                    })}
                </div>

                <div className="header-left-group-divider"></div>

                <AssemblerButtons className="header-buttons header-assembler-buttons" />
            </div>

            <strong className="header-title">Assembly Reality</strong>
        </header>
    );
}

export default Header;