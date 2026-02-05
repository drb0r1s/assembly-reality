import { Images } from "../../data/Images";

const MobileNavigation = ({ setActiveModal }) => {
    const buttons = ["Menu", "Memory", "Hardware"];
    const ButtonIcons = [Images.MenuIcon, Images.MemoryIcon, Images.HardwareIcon];

    return(
        <div className="mobile-navigation">
            {buttons.map(((button, index) => {
                const ButtonIcon = ButtonIcons[index];
                
                return <button
                    key={button}
                    onClick={() => setActiveModal(button)}
                >
                    <ButtonIcon className="mobile-navigation-button-icon" />
                    <p>{button}</p>
                </button>;
            }))}
        </div>
    );
}

export default MobileNavigation;