import MobileHeader from "./MobileHeader";
import AssemblerButtons from "../AssemblerButtons";
import SpeedDashboard from "../SpeedDashboard";
import FileDashboard from "../FileDashboard";
import LightThemeButton from "../LightThemeButton";

const MobileMenu = ({ componentName, style, onReturn }) => {
    return(
        <div className="mobile-menu" style={style}>
            {<MobileHeader title="Menu" onReturn={onReturn} />}

            <div className="mobile-menu-content">
                <h1>Assembly Reality</h1>

                <div className="mobile-menu-content-section">
                    <strong className="mobile-menu-content-section-title">Commands</strong>
                    <AssemblerButtons />
                </div>

                {componentName === "Menu" && <div className="mobile-menu-content-section">
                    <strong className="mobile-menu-content-section-title">Speed</strong>
                    
                    <div className="mobile-menu-content-section-speed-dashboard-holder">
                        <SpeedDashboard />
                    </div>
                </div>}

                <div className="mobile-menu-content-section">
                    <strong className="mobile-menu-content-section-title">File</strong>
                    <FileDashboard />
                </div>

                <div className="mobile-menu-content-section">
                    <strong className="mobile-menu-content-section-title">View</strong>
                    <LightThemeButton />
                </div>
            </div>
        </div>
    );
}

export default MobileMenu;