import { useState, useEffect, useContext } from "react";
import RichEditor from "../RichEditor";
import EditorError from "./EditorError";
import { GlobalContext } from "../../context/GlobalContext";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../Manager";

const Editor = () => {
    const { assembler, assemblerWorker } = useContext(GlobalContext);
    
    const [code, setCode] = useState("");
    const [error, setError] = useState({ type: "", content: "" });

    const speed = useManagerValue("speed");

    useEffect(() => {
        const unsubscribeAssemble = Manager.subscribe("assemble", () => {
            if(!assemblerWorker) return;
            assemblerWorker.postMessage({ action: "assemble", payload: code });
        });

        const unsubscribeRun = Manager.subscribe("run", () => {
            if(!assemblerWorker) return;
            assemblerWorker.postMessage({ action: "run", payload: speed });
        });

        assemblerWorker.onmessage = e => {
            const { action, data, error } = e.data;

            if(error) {
                setError(error);
                return;
            }

            switch(action) {
                case "assemble":
                    assembler.memory.copy(data);

                    Manager.trigger("memoryUpdate", { memory: data.memory, cpuRegisters: { IP: data.cpuRegisters.IP, SP: data.cpuRegisters.SP } });
                    Manager.trigger("cpuRegisterUpdate", data.cpuRegisters);

                    break;
                case "run":
                case "instructionExecuted":
                    assembler.copy(data);

                    Manager.trigger("memoryUpdate", { memory: data.memory, cpuRegisters: { IP: data.cpuRegisters.IP, SP: data.cpuRegisters.SP } });
                    Manager.trigger("cpuRegisterUpdate", data.cpuRegisters);
                    Manager.trigger("displayUpdate", data.memory.matrix.slice(-32));
                    Manager.trigger("ioRegisterUpdate", data.ioRegisters);

                    break;
                case "reset":
                    assembler.copy(data);
                    
                    Manager.trigger("memoryReset");
                    Manager.trigger("cpuRegisterReset");
                    Manager.trigger("displayReset");
                    Manager.trigger("ioRegisterReset");

                    break;
            }
        };

        return () => {
            unsubscribeAssemble();
            unsubscribeRun();
        };
    }, [code, speed]);
    
    return(
        <div className="editor">
            <RichEditor code={code} onChange={setCode} />
            {error.type && <EditorError error={error} setError={setError} />}
        </div>
    );
}

export default Editor;