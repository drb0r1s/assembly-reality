import { useState, useEffect, useContext } from "react";
import RichEditor from "../RichEditor";
import EditorError from "./EditorError";
import { GlobalContext } from "../../context/GlobalContext";
import { useManagerValue } from "../../hooks/useManagerValue";
import { useCodeAutosave } from "../../hooks/useCodeAutosave";
import { Manager } from "../../helpers/Manager";
import { images } from "../../data/images";

const Editor = () => {
    const { assemblerWorker } = useContext(GlobalContext);
    
    const [pages, setPages] = useState({ list: ["New page"], active: 0, counter: 0 });
    const [codes, setCodes] = useState([""]);
    const [error, setError] = useState({ type: "", content: "" });

    const speed = useManagerValue("speed");

    const isCodeEmpty = useManagerValue("isCodeEmpty");
    const isCodeAssembled = useManagerValue("isCodeAssembled");

    useCodeAutosave({ pages, setPages, codes, setCodes });

    useEffect(() => {
        if(codes[pages.active].length === 0 && !isCodeEmpty) Manager.set("isCodeEmpty", true);
        else if(codes[pages.active].length > 0 && isCodeEmpty) Manager.set("isCodeEmpty", false);

        if(isCodeAssembled) Manager.set("isCodeAssembled", false);
    }, [codes[pages.active]]);

    useEffect(() => {
        const unsubscribeAssemble = Manager.subscribe("assemble", () => {
            if(!assemblerWorker) return;

            Manager.set("isCodeAssembled", true);
            assemblerWorker.postMessage({ action: "assemble", data: codes[pages.active] });
        });

        const unsubscribeRun = Manager.subscribe("run", () => {
            if(!assemblerWorker) return;

            Manager.set("isRunning", true);
            assemblerWorker.postMessage({ action: "run", data: parseInt(speed) });
        });

        const unsubscribeAssembleRun = Manager.subscribe("assembleRun", () => {
            if(!assemblerWorker) return;

            Manager.set("isCodeAssembled", true);
            Manager.set("isRunning", true);

            assemblerWorker.postMessage({ action: "assembleRun", data: { code: codes[pages.active], speed: parseInt(speed) } });
        });

        const unsubscribePause = Manager.subscribe("pause", () => {
            if(!assemblerWorker) return;

            Manager.set("isRunning", false);
            assemblerWorker.postMessage({ action: "pause" });
        });

        const unsubscribeStep = Manager.subscribe("step", () => {
            if(!assemblerWorker) return;
            assemblerWorker.postMessage({ action: "step" });
        });

        const unsubscribeCodeTransfer = Manager.subscribe("codeTransfer", data => {
            if(codes[pages.active].length === 0) setCodes(prevCodes => {
                const newCodes = [];

                for(let i = 0; i < prevCodes.length; i++) {
                    if(i === pages.active) newCodes.push(data);
                    else newCodes.push(prevCodes[i]);
                }

                return newCodes;
            });

            else {
                setPages(prevPages => {
                    return {
                        list: [...prevPages.list, `New page (${prevPages.counter + 1})`],
                        active: prevPages.list.length,
                        counter: prevPages.counter + 1
                    };
                });

                setCodes(prevCodes => [...prevCodes, data]);
            }
        });

        const unsubscribeCodeRequest = Manager.subscribe("codeRequest", () => Manager.trigger("codeResponse", {
            title: pages.list[pages.active],
            content: codes[pages.active]
        }));

        assemblerWorker.onmessage = e => {
            const { action, data, error } = e.data;

            if(error) {
                setError(error);
                return;
            }

            switch(action) {
                case "assemble":
                    Manager.trigger("ramUpdate", data?.ram);
                    Manager.trigger("linesUpdate", data?.lines);
                    Manager.trigger("cpuRegistersPing");
                    Manager.trigger("graphicsReset"); // If something was left on the canvas, it is a good idea to reset it, just in case.

                    break;
                // We receive the message with the action "run" only when the execution has ended.
                case "run":
                    Manager.set("isRunning", false);
                    Manager.set("isExecuted", true);
                    
                    break;
                case "instructionExecuted":
                    if(speed >= 10000) return;

                    Manager.trigger("ramUpdate", data?.ram);
                    Manager.trigger("cpuRegistersPing");

                    break;
                case "step":
                    Manager.trigger("highlightLine", data);
                    break;
                case "reset":
                    Manager.set("isRunning", false);    
                    Manager.set("isExecuted", false);
                
                    Manager.trigger("ramReset");
                    Manager.trigger("cpuRegistersPing");
                    Manager.trigger("ioRegistersPing");
                    Manager.trigger("ioRegistersTimerPing");
                    Manager.trigger("graphicsReset");
                    Manager.trigger("unhighlightLine");

                    break;
                case "textDisplayPing":
                    Manager.trigger("textDisplayPing");
                    break;
                case "ioRegistersPing":
                    Manager.trigger("ioRegistersPing");
                    break;
                case "ioRegistersTimerPing":
                    Manager.trigger("ioRegistersTimerPing");
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

        return () => {
            unsubscribeAssemble();
            unsubscribeRun();
            unsubscribeAssembleRun();
            unsubscribePause();
            unsubscribeStep();
            unsubscribeCodeTransfer();
            unsubscribeCodeRequest();
        };
    }, [pages.active, codes[pages.active], speed]);

    function addPage() {
        setPages(prevPages => {
            const newPagesList = [...prevPages.list, `New page (${prevPages.counter + 1})`];
            
            return {
                list: newPagesList,
                active: newPagesList.length - 1,
                counter: prevPages.counter + 1
            };
        });

        setCodes(prevCodes => [...prevCodes, ""]);
    }

    function deletePage(e, target) {
        e.stopPropagation();
        if(!target) return; // The first page cannot be deleted.

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
    
    return(
        <div className="editor">
            <div className="editor-pages">
                {pages.list.map((page, index) => {
                    return <div
                        key={index}
                        className={`editor-page ${index === pages.active ? "editor-active-page" : ""}`}
                        onClick={() => setPages({...pages, active: index})}
                    >
                        <div className="editor-page-left-group">
                            <img src={images.pageIcon} alt="PAGE" />
                            <p>{page}</p>
                        </div>

                        <button
                            style={index === 0 ? { opacity: "0" } : {}}
                            onClick={e => deletePage(e, index)}
                        ><img src={images.xIcon} alt="X" /></button>
                    </div>;
                })}

                <button
                    className="editor-add-button"
                    onClick={addPage}
                >
                    <img src={images.addIcon} alt="ADD" />
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