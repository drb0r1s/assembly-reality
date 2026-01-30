import React, { useCallback } from "react"

const IORegister = React.memo(({ name, value, index }) => {
    const getHex = useCallback(number => number.toString(16).toUpperCase().padStart(4, "0"), []);
    
    return(
        <div
            key={name}
            className="io-register"
        >
            <p>{getHex(index)}</p>
            <p>{name}</p>
            <p>{getHex(value)}</p>
        </div>
    );
});

export default IORegister;