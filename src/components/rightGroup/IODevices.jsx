import { useState, useEffect, useRef, useContext } from "react";
import MiniHeader from "../MiniHeader";
import { GlobalContext } from "../../context/GlobalContext";
import { useLinkedResizing } from "../../hooks/useLinkedResizing";
import { useResizeObserver } from "../../hooks/useResizeObserver";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../Manager";
import { images } from "../../data/images";
import { TextModeData } from "../../assembler/TextModeData";

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
        const unsubscribeMemoryReset = Manager.subscribe("ramReset", () => setMemoryVersion(prevVersion => prevVersion + 1));

        const unsubscribeGraphicsEnabled = Manager.subscribe("graphicsEnabled", () => { canvasStrongRef.current.style.opacity = "0" });
        const unsubscribeGraphicsDisabled = Manager.subscribe("graphicsDisabled", () => { canvasStrongRef.current.style.opacity = "" });
        const unsubscribeGraphicsRedraw = Manager.subscribe("graphicsRedraw", redrawCanvas);
        const unsubscribeGraphicsReset = Manager.subscribe("graphicsReset", resetCanvas);

        initializeCanvas();
        
        return () => {
            unsubscribeMiniDisplayPing();
            unsubscribeMemoryReset();

            unsubscribeGraphicsEnabled();
            unsubscribeGraphicsDisabled();
            unsubscribeGraphicsRedraw();
            unsubscribeGraphicsReset();
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

    function redrawCanvas(data) {
        const vidMode = assembler.ioRegisters.getValue("VIDMODE");

        // Bitmap
        if(vidMode > 1) for(let i = 0; i < data.length; i++) drawPixel(data[i]);

        // Text
        else {
            // Background color cannot be changed in bitmap mode.
            if(data[0] === "background") drawBackground();

            else {
                const backgroundColor = assembler.graphics.getReserved("background");
                const [scrollX, scrollY] = assembler.graphics.getReserved("scroll");
                
                for(let i = 0; i < data.length; i++) drawCharacter(data[i], backgroundColor, scrollX, scrollY);
                ctxRef.current.putImageData(imageDataRef.current, 0, 0);
            }
        }
    }

    function drawPixel(data) {
        const [x, y, color] = data;
        const { r, g, b } = color;

        ctxRef.current.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctxRef.current.fillRect(x, y, 1, 1);
    }

    function drawCharacter(data, backgroundColor, scrollX, scrollY) {
        const [x, y, ascii, color] = data;

        const imageData = imageDataRef.current;

        const character = {
            height: 16,
            width: 8,
            bits: ascii * 32, // 32 bits are reserved for each ASCII character.
            top: y,
            left: x,
            bottom: y * 16,
            right: x * 8
        };
        
        const screenSize = 256;

        const screen = {
            x: character.right - scrollX,
            y: character.bottom - scrollY
        };

        // We need to check if character is totally off the screen.
        if(
            screen.x <= -character.width * 2 ||
            screen.x >= screenSize ||
            screen.y <= -character.height ||
            screen.y >= screenSize
        ) return;

        for(let i = 0; i < character.height; i++) {
            const y = screen.y + i;
            if(y < 0 || y >= screenSize) continue; // This line of pixels is off the screen on y.
            
            const firstHalf = TextModeData.TEXT[character.bits + i * 2];
            const secondHalf = TextModeData.TEXT[character.bits + i * 2 + 1];
                
            const lineBits = (firstHalf << 8) | secondHalf;

            for(let j = 0; j < character.width * 2; j++) {
                const x = screen.x + j;
                if(x < 0 || x >= screenSize) continue; // This pixel is off the screen on x.
                
                const lineBit = (lineBits >> (15 - j)) & 1;
                const usedColor = lineBit ? color : backgroundColor;

                const px = (y * screenSize + x) * 4;

                imageData.data[px] = usedColor.r;
                imageData.data[px + 1] = usedColor.g;
                imageData.data[px + 2] = usedColor.b;
                imageData.data[px + 3] = 255;
            }
        }
    }

    function drawBackground() {
        const backgroundColor = assembler.graphics.getReserved("background");
        const { r, g, b } = backgroundColor;

        const imageData = imageDataRef.current;

        for(let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = r;
            imageData.data[i + 1] = g;
            imageData.data[i + 2] = b;
            imageData.data[i + 3] = 255;
        }

        ctxRef.current.putImageData(imageData, 0, 0);
    }

    function resetCanvas() {
        canvasStrongRef.current.style.opacity = "";

        frameBufferRef.current.fill(0xFF000000);
        ctxRef.current.putImageData(imageDataRef.current, 0, 0);
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