const MiniHeader = ({ title, ref }) => {
    return(
        <div className="mini-header" ref={ref}>
            <strong>{title}</strong>
        </div>
    );
}

export default MiniHeader;