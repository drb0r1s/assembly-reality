import { useState, useEffect, useContext } from "react";
import RichEditor from "../RichEditor";
import EditorError from "./EditorError";
import { GlobalContext } from "../../context/GlobalContext";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../Manager";
import { images } from "../../data/images";

const Editor = () => {
    const { assemblerWorker } = useContext(GlobalContext);
    
    const [pages, setPages] = useState({ list: ["New page"], active: 0, counter: 0 });
    const [codes, setCodes] = useState([""]);
    const [error, setError] = useState({ type: "", content: "" });

    const speed = useManagerValue("speed");

    // THIS AUTOSAVE SYSTEM IS TEMPORARILY NOT IN USE
    // AUTOSAVE GET
    /*useEffect(() => {
        const savedCode = JSON.parse(localStorage.getItem("ASSEMBLY_REALITY_CODE"));

        setPages(savedCode.pages);
        setCodes(savedCode.codes);
    }, []);

    // AUTOSAVE SET
    useEffect(() => {
        return () => {
            localStorage.setItem("ASSEMBLY_REALITY_CODE", JSON.stringify({ pages, codes }));
        }
    }, [pages, codes]);*/

    useEffect(() => {
        const unsubscribeAssemble = Manager.subscribe("assemble", () => {
            if(!assemblerWorker) return;
            assemblerWorker.postMessage({ action: "assemble", payload: codes[pages.active] });
        });

        const unsubscribeRun = Manager.subscribe("run", () => {
            if(!assemblerWorker) return;

            Manager.set("isRunning", true);
            assemblerWorker.postMessage({ action: "run", payload: parseInt(speed) });
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
                    Manager.trigger("ramUpdate", data);
                    Manager.trigger("cpuRegistersPing");
                    Manager.trigger("graphicsReset"); // If something was left on the canvas, it is a good idea to reset it, just in case.

                    break;
                // We receive the message with the action "run" only when the execution has ended.
                // NOTE: In the past, "run" action used to .trigger "ramUpdate" and "cpuRegistersPing", with new update (calling assembler.updateUI() at the end of the execution) it's no longer useful.
                case "run":
                    Manager.set("isRunning", false);
                    break;
                case "instructionExecuted":
                    if(speed >= 10000) return;

                    Manager.trigger("ramUpdate", data);
                    Manager.trigger("cpuRegistersPing");

                    break;
                case "reset":
                    Manager.set("isRunning", false);    
                
                    Manager.trigger("ramReset");
                    Manager.trigger("cpuRegistersPing");
                    Manager.trigger("ioRegistersPing");
                    Manager.trigger("graphicsReset");

                    break;
                case "miniDisplayUpdate":
                    Manager.trigger("miniDisplayPing");
                    break;
                case "ioRegistersUpdate":
                    Manager.trigger("ioRegistersPing");
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