import HeaderDropdown from "./HeaderDropdown";
import { useDropdown } from "../../hooks/useDropdown";
import { headerButtons } from "../../data/headerButtons";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../Manager";
import { images } from "../../data/images";

const Header = () => {
    const { dropdown, enableDropdown, disableDropdown, dropdownRefs } = useDropdown({ view: false, speed: false });

    const speed = useManagerValue("speed");
    const isRunning = useManagerValue("isRunning");

    function handleButton(button) {
        switch(button) {
            case "Assemble":
                Manager.trigger("assemble");
                break;
            case "Run":
                Manager.trigger("run");
                break;
            case "Pause":
                Manager.trigger("pause");
                break;
            case "Step":
                Manager.trigger("step");
                break;
            case "Reset":
                Manager.trigger("reset");
                break;
        }
    }

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

                <div className="header-buttons header-regular-buttons">
                    {headerButtons.regular.map((button, index) => {
                        if(button.title === "Run") return <div
                            key={index}
                            className="header-regular-button"
                            onClick={() => handleButton(isRunning ? "Pause" : "Run")}
                        >
                            <img src={isRunning ? images.pauseIcon : images.runIcon} alt={isRunning ? "PAUSE" : "RUN"} />
                            <p>{isRunning ? "Pause" : "Run"}</p>
                        </div>;
                        
                        return <button
                            key={index}
                            className="header-regular-button"
                            onClick={() => handleButton(button.title)}
                        >
                            <img src={button.icon} alt={button.title.toUpperCase()} />
                            <p>{button.title}</p>
                        </button>;
                    })}
                </div>
            </div>

            <strong className="header-title">Assembly Reality</strong>
        </header>
    );
}

export default Header;