const DraggableHeader = ({ title, ref }) => {
    return(
        <div className="draggable-header" ref={ref}>
            <strong>{title}</strong>
        </div>
    );
}

export default DraggableHeader;