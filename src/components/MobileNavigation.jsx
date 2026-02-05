import { useNavigate } from "react-router-dom";
import { Images } from "../data/Images";

const MobileNavigation = () => {
    const navigate = useNavigate();

    const buttons = ["Menu", "Editor", "Memory", "Hardware"];
    const ButtonIcons = [Images.MenuIcon, Images.EditorIcon, Images.MemoryIcon, Images.HardwareIcon];
    
    function handleClick(button) {
        if(button === "menu") {

        }

        else if(button === "editor") navigate("/");
        else navigate(`/${button}`);
    }

    return(
        <div className="mobile-navigation">
            {buttons.map(((button, index) => {
                const ButtonIcon = ButtonIcons[index];
                
                return <button
                    key={button}
                    onClick={() => handleClick(button.toLowerCase())}
                >
                    <ButtonIcon className="mobile-navigation-button-icon" />
                    <p>{button}</p>
                </button>;
            }))}
        </div>
    );
}

export default MobileNavigation;