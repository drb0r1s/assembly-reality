import { useState, useEffect, useRef, useContext, useMemo, useCallback } from "react";
import AssemblerButtons from "./AssemblerButtons";
import { GlobalContext } from "../context/GlobalContext";
import { useManagerValue } from "../hooks/useManagerValue";
import { Manager } from "../helpers/Manager";
import { DisplayRenderer } from "../helpers/DisplayRenderer";
import { Images } from "../data/Images";

const Display = ({ style, isExpanded }) => {
    const { assembler, assemblerWorker, sharedCanvas } = useContext(GlobalContext);
        
    const matrix = assembler.ram.matrix.getMatrix().slice(-32);

    const [_, setMemoryVersion] = useState(0);
    const [keyboard, setKeyboard] = useState({ isActive: false, activeCharacter: "" });
    const [isCanvasStrongDisabled, setIsCanvasStrongDisabled] = useState(false);
    
    const canvasRef = useRef(null);
    const canvasStrongRef = useRef(null);

    const displayRendererRef = useRef(null);    

    const isLightTheme = useManagerValue("isLightTheme");

    const keyboardStyle = useMemo(() => { return {
        color: keyboard.isActive ? "#405A85" : isLightTheme ? "#1A1A1A" : "#F4F4F4"
    }}, [keyboard.isActive, isLightTheme]);

    const handleKeydown = useCallback(e => {
        if(e.repeat) return;

        assemblerWorker.postMessage({ action: "keyboardEvent", data: { 
            type: "keydown",
            character: e.key.charCodeAt(0)
        }});

        setKeyboard(prevKeyboard => { return {...prevKeyboard, activeCharacter: e.key} });
    }, [assemblerWorker]);

    const handleKeyup = useCallback(e => {
        assemblerWorker.postMessage({ action: "keyboardEvent", data: { 
            type: "keyup",
            character: e.key.charCodeAt(0)
        }});

        setKeyboard(prevKeyboard => { return {...prevKeyboard, activeCharacter: ""} });
    }, [assemblerWorker]);

    const handleClick = useCallback(e => {
        if(!e.target.classList.contains("display-keyboard-group")) setKeyboard({ isActive: false, activeCharacter: "" });
    }, []);

    useEffect(() => {
        // Initializing DisplayRenderer.
        const displayRenderer = new DisplayRenderer(canvasRef.current, sharedCanvas, assembler);

        displayRenderer.initializeWebGL();
        displayRendererRef.current = displayRenderer;

        // "Assembly Reality" title updating.
        const vidMode = assembler.ioRegisters.getValue("VIDMODE");
        setIsCanvasStrongDisabled(vidMode !== 0);
        
        const unsubscribeTextDisplayPing = Manager.subscribe("textDisplayPing", () => setMemoryVersion(prevVersion => prevVersion + 1));
        const unsubscribeMemoryReset = Manager.subscribe("ramReset", () => setMemoryVersion(prevVersion => prevVersion + 1));

        const unsubscribeGraphicsEnabled = Manager.subscribe("graphicsEnabled", data => {
            canvasStrongRef.current.style.opacity = "0";
            if(data === 2) displayRenderer.drawMemory();
        });

        const unsubscribeGraphicsDisabled = Manager.subscribe("graphicsDisabled", () => {
            canvasStrongRef.current.style.opacity = "";
            displayRenderer.resetCanvas();
        });

        const unsubscribeGraphicsRedraw = Manager.subscribe("graphicsRedraw", data => displayRenderer.redrawCanvas(data));

        const unsubscribeGraphicsReset = Manager.subscribe("graphicsReset", () => {
            canvasStrongRef.current.style.opacity = "";
            displayRenderer.resetCanvas();
        });
        
        return () => {
            unsubscribeTextDisplayPing();
            unsubscribeMemoryReset();

            unsubscribeGraphicsEnabled();
            unsubscribeGraphicsDisabled();
            unsubscribeGraphicsRedraw();
            unsubscribeGraphicsReset();

            displayRenderer.cleanup();
        };
    }, []);
    
    useEffect(() => {
        if(keyboard.isActive) {
            window.addEventListener("keydown", handleKeydown);
            window.addEventListener("keyup", handleKeyup);
            window.addEventListener("click", handleClick);
        }

        return () => {
            window.removeEventListener("keydown", handleKeydown);
            window.removeEventListener("keyup", handleKeyup);
            window.removeEventListener("click", handleClick);
        }
    }, [keyboard.isActive]);

    useEffect(() => {
        if(isCanvasStrongDisabled) canvasStrongRef.current.style.opacity = "0";
    }, [isCanvasStrongDisabled]);
    
    return(
        <div
            className="display"
            style={style}
        >
            {isExpanded && <AssemblerButtons
                className="display-buttons"
                isExpanded={isExpanded}
            />}

            <div className="display-canvas-holder">
                <canvas ref={canvasRef}></canvas>
                <strong ref={canvasStrongRef}>Assembly Reality</strong>
            </div>

            <div className="display-text-display">
                {Array.from({ length: matrix.length }, (_, index) => {
                    const element = matrix[index];

                    return <p
                        key={index}
                        className="display-text-display-element"
                    >{element !== 0 ? String.fromCharCode(element) : ""}</p>;
                })}
            </div>

            <button
                className={`display-keyboard ${keyboard.isActive ? "display-keyboard-active" : ""} display-keyboard-group`}
                onClick={e => {
                    if(e.detail === 0) return; // This is used to prevent triggering the click event with a spacebar.
                    setKeyboard(prevKeyboard => { return { ...prevKeyboard, isActive: !prevKeyboard.isActive } });
                }}
            >
                <div className="display-keyboard-left-group display-keyboard-group">
                    <Images.KeyboardIcon
                        className="display-keyboard-group display-keyboard-icon"
                        style={keyboardStyle}
                    />

                    <p className="display-keyboard-group">Keyboard</p>
                </div>

                <p
                    className="display-keyboard-key display-keyboard-group"
                    style={keyboard.activeCharacter ? { opacity: "1" } : {}}
                >{keyboard.activeCharacter}</p>
            </button>
        </div>
    );
}

export default Display;