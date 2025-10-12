const MiniHeader = ({ title, style, ref }) => {
    return(
        <div className="mini-header" style={style} ref={ref}>
            <strong>{title}</strong>
        </div>
    );
}

export default MiniHeader;