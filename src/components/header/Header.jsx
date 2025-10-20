import { useDispatch } from "react-redux";
import HeaderDropdown from "./HeaderDropdown";
import { mainActions } from "../../state/reducers/mainSlice";
import { useDropdown } from "../../hooks/useDropdown";
import { headerButtons } from "../../data/headerButtons";

const Header = () => {
    const dispatch = useDispatch();
    const { dropdown, enableDropdown, disableDropdown, dropdownRefs } = useDropdown({ view: false, speed: false });

    function handleButton(button) {
        switch(button) {
            case "Assemble":
                dispatch(mainActions.updateAssemble(true));
                break;
            case "Run": break;
            case "Step": break;
            case "Reset":
                dispatch(mainActions.updateReset(true));
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
                            <img src={button.icon} alt={button.title.toUpperCase()} />
                        </div>;
                    })}
                </div>

                <div className="header-left-group-divider"></div>

                <div className="header-buttons header-regular-buttons">
                    {headerButtons.regular.map((button, index) => {
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

            <strong className="header-title">16-bit Assembly Simulator</strong>
        </header>
    );
}

export default Header;