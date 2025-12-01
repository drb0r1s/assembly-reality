import { useEffect, useRef } from "react";
import { GlobalContext } from "./GlobalContext";
import { useWorker } from "../hooks/useWorker";
import { Assembler } from "../assembler/Assembler";

const ContextWrapper = ({ children }) => {
    const memoryBuffer = new SharedArrayBuffer(258 * 16);

    const assembler = useRef(new Assembler(memoryBuffer)).current;
    const assemblerWorker = useWorker();

    useEffect(() => {
        if(assemblerWorker) assemblerWorker.postMessage({ action: "memoryInitialization", payload: memoryBuffer });
    }, [assemblerWorker]);

    return(
        <GlobalContext.Provider value={{ assembler, assemblerWorker }}>
            {children}
        </GlobalContext.Provider>
    );
}

export default ContextWrapper;