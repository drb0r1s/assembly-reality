import { useEffect, useRef } from "react";
import { GlobalContext } from "./GlobalContext";
import { useWorker } from "../hooks/useWorker";
import { Assembler } from "../assembler/Assembler";

const ContextWrapper = ({ children }) => {
    const cpuRegistersBuffer = new SharedArrayBuffer(7 * 2);
    const ioRegistersBuffer = new SharedArrayBuffer(11 * 2);
    const ramBuffer = new SharedArrayBuffer(258 * 16);
    const graphicsBuffer = new SharedArrayBuffer(0x10000); // 65536B

    const assembler = useRef(new Assembler(cpuRegistersBuffer, ioRegistersBuffer, ramBuffer, graphicsBuffer)).current;
    const assemblerWorker = useWorker();

    useEffect(() => {
        if(assemblerWorker) assemblerWorker.postMessage({ action: "init", payload: { cpuRegistersBuffer, ioRegistersBuffer, ramBuffer, graphicsBuffer } });
    }, [assemblerWorker]);

    return(
        <GlobalContext.Provider value={{ assembler, assemblerWorker }}>
            {children}
        </GlobalContext.Provider>
    );
}

export default ContextWrapper;