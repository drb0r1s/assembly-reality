const DraggableHeader = ({ title, ref, isDisabled }) => {
    return(
        <div className={`draggable-header ${isDisabled ? "draggable-header-disabled": ""}`} ref={ref}>
            <strong>{title}</strong>
        </div>
    );
}

export default DraggableHeader;