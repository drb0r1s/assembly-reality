const HeaderDropdown = ({ type, ref }) => {
    const dropdownButtons = getDropdownButtons();

    function getDropdownButtons() {
        if(type === "view") return ["Memory", "I/O Registers"];
        else return ["4Hz", "1kHz", "5kHz", "10kHz", "20kHz", "50kHz"];
    }
    
    return(
        <div className="header-dropdown" ref={ref}>
            {dropdownButtons.map((button, index) => {
                return <button
                    key={index}
                >{button}</button>;
            })}
        </div>
    );
}

export default HeaderDropdown;