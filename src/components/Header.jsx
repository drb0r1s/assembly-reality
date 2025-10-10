import { headerButtons } from "../data/headerButtons";

const Header = () => {
    return(
        <header>
            <div className="header-left-group">
                <div className="header-buttons header-dropdown-buttons">
                    {headerButtons.dropdown.map((button, index) => {
                        return <button
                            key={index}
                        >
                            <p>{button.title}</p>
                            <img src={button.icon} alt={button.title.toUpperCase()} />
                        </button>;
                    })}
                </div>

                <div className="header-left-group-divider"></div>

                <div className="header-buttons header-regular-buttons">
                    {headerButtons.regular.map((button, index) => {
                        return <button
                            key={index}
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