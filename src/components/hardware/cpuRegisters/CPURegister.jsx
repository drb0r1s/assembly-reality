import React, { useMemo, useCallback } from "react"
import { useManagerValue } from "../../../hooks/useManagerValue";
import { Manager } from "../../../helpers/Manager";

const CPURegister = React.memo(({ name, value }) => {
    const isLightTheme = useManagerValue("isLightTheme");
    const registerColoring = useManagerValue("registerColoring");

    const colors = useMemo(() => { return isLightTheme ? {
        A: "#8FC97A",
        B: "#F2B36A",
        C: "#B48AE3",
        D: "#F58A8A"
    } : {
        A: "#3D691D",
        B: "#C06A08",
        C: "#60218E",
        D: "#E81E1E"
    }}, [isLightTheme]);

    const getTitle = useCallback(() => {
        if(name.length === 1) return `General Purpose Register ${name}`;

        if(name === "IP") return "Instruction Pointer";
        if(name === "SP") return "Stack Pointer";
    }, []);
    
    return(
        <div className={`cpu-register cpu-${name.toLowerCase()}-register`}>
            <strong title={getTitle()}>{name}</strong>

            <p
                style={registerColoring[name] ? { backgroundColor: colors[name] } : {}}
                onClick={() => Manager.set("registerColoring", {...registerColoring, [name]: !registerColoring[name]})}
            >{value}</p>
        </div>
    );
});

export default CPURegister;