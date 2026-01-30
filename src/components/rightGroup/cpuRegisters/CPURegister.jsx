import React from "react"

const CPURegister = React.memo(({ name, value }) => {
    const additionalClass = name === "IP" ? "cpu-ip-register" : name === "SP" ? "cpu-sp-register" : "";

    return(
        <div className={`cpu-register ${additionalClass}`}>
            <strong>{name}</strong>
            <p>{value}</p>
        </div>
    );
});

export default CPURegister;