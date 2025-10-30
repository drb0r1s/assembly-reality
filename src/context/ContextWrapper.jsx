import { useRef } from "react";
import { GlobalContext } from "./GlobalContext";
import { useWorker } from "../hooks/useWorker";
import { Assembler } from "../assembler/Assembler";

const ContextWrapper = ({ children }) => {
    const assembler = useRef(new Assembler()).current;
    const assemblerWorker = useWorker();

    return(
        <GlobalContext.Provider value={{ assembler, assemblerWorker }}>
            {children}
        </GlobalContext.Provider>
    );
}

export default ContextWrapper;