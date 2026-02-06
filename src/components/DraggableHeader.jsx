import { Images } from "../data/Images";

const DraggableHeader = ({ title, iconName, ref, isDisabled }) => {
    const Icon = Images[iconName];
    
    return(
        <div className={`draggable-header ${isDisabled ? "draggable-header-disabled": ""}`} ref={ref}>
            <Icon className="draggable-header-icon" />
            <strong>{title}</strong>
        </div>
    );
}

export default DraggableHeader;