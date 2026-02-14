import { useState, useEffect, useRef, useContext } from "react";
import RichEditor from "../RichEditor";
import EditorError from "./EditorError";
import { GlobalContext } from "../../context/GlobalContext";
import { useManagerValue } from "../../hooks/useManagerValue";
import { useCodeAutosave } from "../../hooks/useCodeAutosave";
import { Manager } from "../../helpers/Manager";
import { Images } from "../../data/Images";

const Editor = () => {
    const { assemblerWorker } = useContext(GlobalContext);
    
    const [pages, setPages] = useState({ list: ["New page"], active: 0, counter: 0 });
    const [codes, setCodes] = useState([""]);
    const [error, setError] = useState({ type: "", content: "" });

    const pagesRef = useRef(pages);
    const codesRef = useRef(codes);

    const speed = useManagerValue("speed");
    const speedRef = useRef(speed);

    const isCodeEmpty = useManagerValue("isCodeEmpty");

    useCodeAutosave({ pages, setPages, codes, setCodes });
    
    useEffect(() => { pagesRef.current = pages }, [pages]);
    useEffect(() => { codesRef.current = codes }, [codes]);
    useEffect(() => { speedRef.current = speed }, [speed]);

    useEffect(() => {
        const newIsEmpty = codes[pages.active].length === 0;
        if(newIsEmpty !== isCodeEmpty) Manager.set("isCodeEmpty", newIsEmpty);

        Manager.set("isAssembled", false);
    }, [codes[pages.active]]);

    useEffect(() => {
        if(!assemblerWorker) return;

        assemblerWorker.onmessage = e => {
            const { action, data, error } = e.data;

            if(error) {
                if(action === "assemble") Manager.set("isAssembleError", true);

                setError(error);
                if(e.data?.line) Manager.trigger("highlightLine", e.data.line); // This happens only if runtime error was triggered by the "step" mode.

                return;
            }

            switch(action) {
                case "assemble":
                    Manager.sequence(() => {
                        // We can safely update this property only when assembling the code has finished!
                        Manager.set("isMemoryEmpty", false);
                        Manager.set("isAssembleError", false);

                        Manager.trigger("ramUpdate", data?.ram);
                        Manager.trigger("linesUpdate", data?.lines);
                        Manager.trigger("cpuRegistersPing");
                        Manager.trigger("cpuRegistersCollectionUpdate", data?.cpuRegisters);
                        Manager.trigger("graphicsReset"); // If something was left on the canvas, it is a good idea to reset it, just in case.
                    });

                    break;
                // We receive the message with the action "run" only when the execution has ended.
                case "run":
                // In case a runtime error happens, it is important to update the UI.
                case "runtimeErrorStop":
                    Manager.sequence(() => {
                        Manager.set("isRunning", false);
                        Manager.set("isExecuted", true);
                    });
                    
                    break;
                case "instructionExecuted":
                    if(speedRef.current >= 10000) return;

                    Manager.sequence(() => {
                        Manager.trigger("ramUpdate", data?.ram);
                        Manager.trigger("cpuRegistersPing");
                    });

                    break;
                case "step":
                    if(data === -1) Manager.set("isExecuted", true);
                    else Manager.trigger("highlightLine", data);
                    break;
                case "textDisplayPing":
                    Manager.trigger("textDisplayPing");
                    break;
                case "ioRegistersPing":
                    Manager.trigger("ioRegistersPing");
                    break;
                case "ioRegistersSlowPing":
                    Manager.trigger("ioRegistersSlowPing");
                    break;
                case "graphicsEnabled":
                    Manager.trigger("graphicsEnabled", data);
                    break;
                case "graphicsDisabled":
                    Manager.trigger("graphicsDisabled");
                    break;
                case "graphicsRedraw":
                    Manager.trigger("graphicsRedraw", data);
                    break;
            }
        };
    }, [assemblerWorker]);

    useEffect(() => {
        if(!assemblerWorker) return;

        const unsubscribeAssemble = Manager.subscribe("assemble", () => {
            Manager.sequence(() => {
                Manager.set("isAssembled", true);
                Manager.set("isExecuted", false);
            });

            assemblerWorker.postMessage({ action: "assemble", data: getActiveCode() });
        });

        const unsubscribeRun = Manager.subscribe("run", () => {
            Manager.set("isRunning", true);
            assemblerWorker.postMessage({ action: "run", data: parseInt(speedRef.current) });
        });

        const unsubscribeAssembleRun = Manager.subscribe("assembleRun", () => {
            Manager.sequence(() => {
                Manager.set("isMemoryEmpty", false);
                Manager.set("isAssembled", true);
                Manager.set("isRunning", true);
            });

            assemblerWorker.postMessage({ action: "assembleRun", data: { code: getActiveCode(), speed: parseInt(speedRef.current) } });
        });

        const unsubscribePause = Manager.subscribe("pause", () => {
            Manager.set("isRunning", false);
            assemblerWorker.postMessage({ action: "pause" });
        });

        const unsubscribeStep = Manager.subscribe("step", () => {
            assemblerWorker.postMessage({ action: "step" });
        });

        const unsubscribeReset = Manager.subscribe("reset", () => {
            Manager.sequence(() => {
                Manager.set("isMemoryEmpty", true);
                Manager.set("isAssembled", false);
                Manager.set("isAssembleError", false);
                Manager.set("isRunning", false);
                Manager.set("isExecuted", false);

                Manager.trigger("ramReset");
                Manager.trigger("cpuRegistersPing");
                Manager.trigger("cpuRegistersCollectionUpdate", { collection: {} });
                Manager.trigger("ioRegistersPing");
                Manager.trigger("ioRegistersSlowPing");
                Manager.trigger("graphicsReset");
                Manager.trigger("unhighlightLine");
            });
            
            assemblerWorker.postMessage({ action: "reset" });
        });

        const unsubscribeCodeTransfer = Manager.subscribe("codeTransfer", data => {
            if(getActiveCode().length === 0) setCodes(prevCodes => {
                const newCodes = [];

                for(let i = 0; i < prevCodes.length; i++) {
                    if(i === pagesRef.current.active) newCodes.push(data);
                    else newCodes.push(prevCodes[i]);
                }

                return newCodes;
            });

            else addPage(data);
        });

        const unsubscribeCodeRequest = Manager.subscribe("codeRequest", () => Manager.trigger("codeResponse", {
            title: pagesRef.current.list[pagesRef.current.active],
            content: getActiveCode()
        }));

        return () => {
            unsubscribeAssemble();
            unsubscribeRun();
            unsubscribeAssembleRun();
            unsubscribePause();
            unsubscribeStep();
            unsubscribeReset();
            unsubscribeCodeTransfer();
            unsubscribeCodeRequest();
        };
    }, [assemblerWorker, speed]);

    function getActiveCode() {
        return codesRef.current[pagesRef.current.active];
    }

    function addPage(content) {
        clearMemory();

        setPages(prevPages => {
            const newPagesList = [...prevPages.list, `New page (${prevPages.counter + 1})`];
            
            return {
                list: newPagesList,
                active: newPagesList.length - 1,
                counter: prevPages.counter + 1
            };
        });

        setCodes(prevCodes => [...prevCodes, content]);
    }

    function deletePage(e, target) {
        e.stopPropagation();
        if(!target) return; // The first page cannot be deleted.

        clearMemory();

        setPages(prevPages => {
            let newActive = prevPages.active;
            
            if(
                prevPages.active === target ||
                newActive > target
            ) newActive--; // Go to the previous page.
            
            const newList = prevPages.list.filter((_, index) => index !== target);
            
            return {
                list: newList,
                active: newActive,
                counter: prevPages.counter
            };
        });

        setCodes(prevCodes => {
            const newCodes = prevCodes.filter((_, index) => index !== target);
            return newCodes;
        });
    }

    function switchPage(active) {
        clearMemory();
        setPages(prevPages => { return {...prevPages, active} });
    }

    function clearMemory() {
        Manager.trigger("reset");
    }
    
    return(
        <div className="editor">
            <div className="editor-pages">
                {pages.list.map((page, index) => {
                    return <div
                        key={page}
                        className={`editor-page ${index === pages.active ? "editor-active-page" : ""}`}
                        onClick={() => switchPage(index)}
                    >
                        <div className="editor-page-left-group">
                            <Images.PageIcon className="editor-page-icon" />
                            <p>{page}</p>
                        </div>

                        <button
                            style={index === 0 ? { opacity: "0" } : {}}
                            onClick={e => deletePage(e, index)}
                        ><Images.XIcon className="editor-page-x-icon" /></button>
                    </div>;
                })}

                <button
                    className="editor-add-button"
                    onClick={() => addPage("")}
                >
                    <Images.AddIcon className="editor-add-button-icon" />
                </button>
            </div>

            <RichEditor code={codes[pages.active]} onChange={newCode => {
                const newCodes = [...codes];
                newCodes[pages.active] = newCode;
                setCodes(newCodes);
            }} />

            {error.type && <EditorError error={error} setError={setError} />}
        </div>
    );
}

export default Editor;