import { useState, useEffect, useRef, useContext } from "react";
import MiniHeader from "../MiniHeader";
import { GlobalContext } from "../../context/GlobalContext";
import { useLinkedResizing } from "../../hooks/useLinkedResizing";
import { useResizeObserver } from "../../hooks/useResizeObserver";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../Manager";
import { images } from "../../data/images";

const IODevices = ({ rightGroupRef, ioDevicesRef, cpuRegistersRef, ioRegistersRef }) => {
    const { assembler, assemblerWorker } = useContext(GlobalContext);
    
    const [_, setMemoryVersion] = useState(0);
    const [keyboard, setKeyboard] = useState({ isActive: false, activeCharacter: "" });
    const [lowerSection, setLowerSection] = useState({ ref: null }); // This state has to contain the elements inside the object, under the ref property, because of the way React is updating ref objects.
    
    const headerRef = useRef(null);

    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const canvasStrongRef = useRef(null);

    const imageDataRef = useRef(null);
    const frameBufferRef = useRef(null);
    const paletteRef = useRef(null);

    const view = useManagerValue("view");
    
    const ioDevicesHeight = useResizeObserver({ elementRef: ioDevicesRef });
    const lowerSectionHeight = useResizeObserver({ elementRef: lowerSection.ref }); // Here we need to take in the consideration a possibility that CPU Registers section can be disabled.

    useLinkedResizing({
        headerRef,
        elementRef: ioDevicesRef,
        holderRef: rightGroupRef,
        collisionRefs: { next: view.cpuRegisters ? cpuRegistersRef : ioRegistersRef, doubleNext: view.cpuRegisters ? ioRegistersRef : { current: null } }
    });

    useEffect(() => {
        const unsubscribeMiniDisplayPing = Manager.subscribe("miniDisplayPing", () => setMemoryVersion(prevVersion => prevVersion + 1));
        
        const unsubscribeMemoryReset = Manager.subscribe("ramReset", () => {
            setMemoryVersion(prevVersion => prevVersion + 1);
            
            // This ramReset event is useful to reset the canvas and to return the title over the canvas.
            resetCanvas();
            canvasStrongRef.current.style.opacity = "";
        });

        const unsubscribeGraphicsEnabled = Manager.subscribe("graphicsEnabled", () => { canvasStrongRef.current.style.opacity = "0" });
        const unsubscribeGraphicsDisabled = Manager.subscribe("graphicsDisabled", () => { canvasStrongRef.current.style.opacity = "" });
        const unsubscribeGraphicsRedraw = Manager.subscribe("graphicsRedraw", redrawCanvas);7

        const unsubscribeGraphicsRedrawInstant = Manager.subscribe("graphicsRedrawInstant", data => {
            const [x, y, color] = data;
            const { r, g, b } = color;
            
            ctxRef.current.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctxRef.current.fillRect(x, y, 1, 1);
        });

        initializeCanvas();
        
        return () => {
            unsubscribeMiniDisplayPing();
            unsubscribeMemoryReset();

            unsubscribeGraphicsEnabled();
            unsubscribeGraphicsDisabled();
            unsubscribeGraphicsRedraw();
            unsubscribeGraphicsRedrawInstant();
        };
    }, []);

    useEffect(() => {
        const ref = cpuRegistersRef?.current ? cpuRegistersRef : ioRegistersRef;
        setLowerSection({ ref })
    }, [view]);
    
    useEffect(() => {
        const handleKeydown = e => {
            if(e.repeat) return;

            const character = e.key.charCodeAt(0);
            assembler.ioRegisters.keydown(character);

            Manager.trigger("ioRegistersPing");
            assemblerWorker.postMessage({ action: "ioRegistersKeyboard" }); // Trigger the interrupt.

            setKeyboard(prevKeyboard => { return {...prevKeyboard, activeCharacter: e.key} });
        }

        const handleKeyup = e => {
            const character = e.key.charCodeAt(0);
            assembler.ioRegisters.keyup(character);

            Manager.trigger("ioRegistersPing");
            assemblerWorker.postMessage({ action: "ioRegistersKeyboard" }); // Trigger the interrupt.

            setKeyboard(prevKeyboard => { return {...prevKeyboard, activeCharacter: ""} });
        }

        if(keyboard.isActive) {
            window.addEventListener("keydown", handleKeydown);
            window.addEventListener("keyup", handleKeyup);
        }

        return () => {
            window.removeEventListener("keydown", handleKeydown);
            window.removeEventListener("keyup", handleKeyup);
        }
    }, [keyboard.isActive]);

    function initializeCanvas() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.height = 256;
        canvas.width = 256;

        ctx.imageSmoothingEnabled = true;

        const imageData = ctx.createImageData(256, 256);
        const frameBuffer = new Uint32Array(imageData.data.buffer);

        const palette = new Uint32Array(256);

        for(let i = 0; i < 256; i++) {
            const r = (i >> 5) & 7;
            const g = (i >> 2) & 7;
            const b = i & 3;

            const R = (r * 255 / 7) | 0;
            const G = (g * 255 / 7) | 0;
            const B = (b * 255 / 3) | 0;

            palette[i] = (255 << 24) | (B << 16) | (G << 8) | R;
        }

        ctxRef.current = ctx;
        imageDataRef.current = imageData;
        frameBufferRef.current = frameBuffer;
        paletteRef.current = palette;
    }

    function redrawCanvas() {
        const graphicsMatrix = assembler.graphics.matrix.getMatrix();

        const ctx = ctxRef.current;
        const imageData = imageDataRef.current;
        const frameBuffer = frameBufferRef.current;
        const palette = paletteRef.current;

        for(let i = 0; i < graphicsMatrix.length; i++) frameBuffer[i] = palette[graphicsMatrix[i]];

        ctx.putImageData(imageData, 0, 0);
    }

    function resetCanvas() {
        assembler.graphics.matrix.reset();
        redrawCanvas();
    }

    return(
        <div className="io-devices" ref={ioDevicesRef}>
            <MiniHeader
                title="Input / Output Devices"
                ref={headerRef}
            />
            
            <div
                className="io-devices-content"
                style={{ height: `${ioDevicesHeight - lowerSectionHeight - 27}px` }} // 27px (header height)
            >
                <div className="io-devices-canvas-holder">
                    <canvas ref={canvasRef}></canvas>
                    <strong ref={canvasStrongRef}>Assembly Simulator</strong>
                </div>

                <div className="io-devices-mini-display">
                    {assembler.ram.matrix.arrayify({ miniDisplay: true }).map((element, index) => {
                        return <p
                            key={index}
                            className="io-devices-mini-display-element"
                        >{element !== 0 ? String.fromCharCode(element) : ""}</p>;
                    })}
                </div>

                <button
                    className={`io-devices-keyboard ${keyboard.isActive ? "io-devices-keyboard-active" : ""}`}
                    onClick={e => {
                        if(e.detail === 0) return; // This is used to prevent triggering the click event with a spacebar.
                        setKeyboard(prevKeyboard => { return {...prevKeyboard, isActive: !prevKeyboard.isActive} });
                    }}
                >
                    <div className="io-devices-keyboard-left-group">
                        <div className="io-devices-keyboard-image-holder">
                            <img
                                src={images.keyboardIcon}
                                alt="KEYBOARD"
                                style={keyboard.isActive ? { opacity: "0" } : {}}
                            />
                            
                            <img
                                src={images.keyboardBlueIcon}
                                alt="KEYBOARD"
                                style={keyboard.isActive ? { opacity: "1" } : {}}
                            />
                        </div>

                        <p>Keyboard</p>
                    </div>

                    <p
                        className="io-devices-keyboard-key"
                        style={keyboard.activeCharacter ? { opacity: "1" } : {}}
                    >{keyboard.activeCharacter}</p>
                </button>
            </div>
        </div>
    );
}

export default IODevices;