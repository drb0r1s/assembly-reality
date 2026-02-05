import { Images } from "../../data/Images";

const MobileHeader = ({ title, onReturn }) => {
    return(
        <div className="mobile-header">
            <button onClick={onReturn}><Images.ReturnIcon className="mobile-header-button-icon" /></button>
            <strong>{title}</strong>
        </div>
    );
}

export default MobileHeader;