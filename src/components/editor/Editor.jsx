import { useState, useEffect, useContext } from "react";
import RichEditor from "../RichEditor";
import EditorError from "./EditorError";
import { GlobalContext } from "../../context/GlobalContext";
import { Manager } from "../../Manager";

const Editor = () => {
    const { assembler, assemblerWorker } = useContext(GlobalContext);
    
    const [code, setCode] = useState("");
    const [error, setError] = useState({ type: "", content: "" });

    useEffect(() => {
        const unsubscribeAssemble = Manager.subscribe("assemble", () => {
            if(!assemblerWorker) return;
            assemblerWorker.postMessage({ action: "assemble", payload: code });
        });

        const unsubscribeRun = Manager.subscribe("run", () => {
            if(!assemblerWorker) return;
            assemblerWorker.postMessage({ action: "run" });
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
                    Manager.trigger("memoryUpdate", data.matrix);

                    break;
                case "run":
                    assembler.copy(data);

                    Manager.trigger("memoryUpdate", assembler.memory.matrix);
                    Manager.trigger("registerUpdate", assembler.registers);

                    break;
                case "reset":
                    assembler.copy(data);

                    Manager.trigger("memoryUpdate", assembler.memory.matrix);
                    Manager.trigger("registerUpdate", assembler.registers);

                    break;
            }
        };

        return () => {
            unsubscribeAssemble();
            unsubscribeRun();
        };
    }, [code]);
    
    return(
        <div className="editor">
            <RichEditor code={code} onChange={setCode} />
            {error.type && <EditorError error={error} setError={setError} />}
        </div>
    );
}

export default Editor;