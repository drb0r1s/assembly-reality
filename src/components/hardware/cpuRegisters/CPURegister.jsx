import React, { useMemo, useCallback } from "react"
import { useManagerValue } from "../../../hooks/useManagerValue";
import { Manager } from "../../../helpers/Manager";

const CPURegister = React.memo(({ name, value }) => {
    const theme = useManagerValue("theme");
    const registerColoring = useManagerValue("registerColoring");

    const colors = useMemo(() => {
        switch(theme) {
            case "dark": return {
                A: "#3D691D",
                B: "#C06A08",
                C: "#60218E",
                D: "#E81E1E"
            }

            case "light": return {
                A: "#8FC97A",
                B: "#F2B36A",
                C: "#B48AE3",
                D: "#F58A8A"
            }

            case "classic": return {}
            case "ocean": return {}
            case "forest": return {}
            case "ruby": return {}
        }
    }, [theme]);

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