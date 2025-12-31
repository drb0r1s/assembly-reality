const Switch = ({ isActive }) => {
    return(
        <div className={`switch ${isActive ? "switch-active" : ""}`}>
            <div className={`switch-ball ${isActive ? "switch-ball-active" : ""}`}></div>
        </div>
    );
}

export default Switch;