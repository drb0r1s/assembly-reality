const MiniHeader = ({ title, style }) => {
    return(
        <div className="mini-header" style={style}>
            <strong>{title}</strong>
        </div>
    );
}

export default MiniHeader;