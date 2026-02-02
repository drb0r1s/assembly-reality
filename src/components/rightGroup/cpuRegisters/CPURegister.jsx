import React, { useMemo } from "react"
import { useManagerValue } from "../../../hooks/useManagerValue";
import { Manager } from "../../../helpers/Manager";

const CPURegister = React.memo(({ name, value }) => {
    const registerColoring = useManagerValue("registerColoring");

    const colors = useMemo(() => { return {
        A: "#3D691D",
        B: "#C06A08",
        C: "#60218E",
        D: "#E81E1E"
    }}, []);
    
    return(
        <div className={`cpu-register cpu-${name.toLowerCase()}-register`}>
            <strong>{name}</strong>

            <p
                style={registerColoring[name] ? { backgroundColor: colors[name] } : {}}
                onClick={() => Manager.set("registerColoring", {...registerColoring, [name]: !registerColoring[name]})}
            >{value}</p>
        </div>
    );
});

export default CPURegister;