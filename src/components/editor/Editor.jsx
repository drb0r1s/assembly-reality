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
                    Manager.trigger("memoryUpdate", data);

                    break;
                case "instructionExecuted":
                    assembler.copy(data);

                    Manager.trigger("memoryUpdate", data.memory);
                    Manager.trigger("registerUpdate", data.registers);

                    break;
                case "reset":
                    assembler.copy(data);
                    
                    Manager.trigger("memoryReset");
                    Manager.trigger("registerReset");

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