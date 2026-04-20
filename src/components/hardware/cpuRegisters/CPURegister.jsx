import React, { useMemo, useCallback } from "react"
import { useManagerValue } from "../../../hooks/useManagerValue";
import { Manager } from "../../../helpers/Manager";

const CPURegister = React.memo(({ name, value }) => {
    const theme = useManagerValue("theme");
    const coloredRegisters = useManagerValue("coloredRegisters");

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

            case "classic": return {
                A: "#6A9E48",
                B: "#C87A20",
                C: "#9f67c7",
                D: "#e85b5b"
            }

            case "ocean": return {
                A: "#3D7855",
                B: "#C07030",
                C: "#5040A0",
                D: "#D03040"
            }

            case "forest": return {
                A: "#4A8828",
                B: "#B07820",
                C: "#5E2A8A",
                D: "#C83030"
            }

            case "ruby": return {
                A: "#3c6920",
                B: "#C07020",
                C: "#6030A0",
                D: "#E04060"
            }
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
                style={coloredRegisters[name] ? { backgroundColor: colors[name] } : {}}
                onClick={() => Manager.sequence(() => {
                    Manager.set("coloredRegisters", {...coloredRegisters, [name]: !coloredRegisters[name]});
                    Manager.trigger("colorRegisters", {...coloredRegisters, [name]: !coloredRegisters[name]});
                })}
            >{value}</p>
        </div>
    );
});

export default CPURegister;