import { useState, useEffect, useRef, useContext } from "react";
import { GlobalContext } from "../context/GlobalContext";
import { Manager } from "../Manager";
import { images } from "../data/images";

const Display = ({ style }) => {
    const { assembler, assemblerWorker, sharedCanvas } = useContext(GlobalContext);
        
    const [_, setMemoryVersion] = useState(0);
    const [keyboard, setKeyboard] = useState({ isActive: false, activeCharacter: "" });
    const [isCanvasStrongDisabled, setIsCanvasStrongDisabled] = useState(false);
    
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const canvasStrongRef = useRef(null);

    const frameBufferRef = useRef(null);

    useEffect(() => {
        // "Assembly Reality" title updating.
        const vidMode = assembler.ioRegisters.getValue("VIDMODE");
        setIsCanvasStrongDisabled(vidMode !== 0);
        
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

        const handleClick = e => {
            if(!e.target.classList.contains("display-keyboard-group")) setKeyboard({ isActive: false, activeCharacter: "" });
        }

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

    function initializeCanvas() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.height = 256;
        canvas.width = 256;

        ctx.imageSmoothingEnabled = true;

        ctxRef.current = ctx;

        // If shared imageData wasn't initialized yet, do it once.
        if(!sharedCanvas.current.imageData) {
            const imageData = ctx.createImageData(256, 256);
            sharedCanvas.current.imageData = imageData;
        }

        // Otherwise, draw everything that was on the other canvas.
        else ctxRef.current.putImageData(sharedCanvas.current.imageData, 0, 0);

        const frameBuffer = new Uint32Array(sharedCanvas.current.imageData.data.buffer);
        frameBufferRef.current = frameBuffer;
    }

    function redrawCanvas(data) {
        const vidMode = assembler.ioRegisters.getValue("VIDMODE");

        // Bitmap
        if(vidMode > 1) {
            for(let i = 0; i < data.length; i++) drawPixel(data[i]);
            ctxRef.current.putImageData(sharedCanvas.current.imageData, 0, 0);
        }

        // Text
        else {
            const backgroundColor = assembler.graphics.getReserved("background");
            const [scrollX, scrollY] = assembler.graphics.getReserved("scroll");
            const text = assembler.graphics.getText();
            
            const vram = assembler.graphics.matrix.getMatrix();

            drawBackground();

            assembler.graphics.forEachCharacter(address => {
                const ascii = vram[address];

                const colorIndex = vram[address + 1];
                const color = assembler.graphics.getRGB(colorIndex);
                    
                if(ascii === 0) return;

                const [x, y] = assembler.graphics.addressToPosition(address);
                drawCharacter([x, y, ascii, color], backgroundColor, scrollX, scrollY, text);
            });
                
            ctxRef.current.putImageData(sharedCanvas.current.imageData, 0, 0);
        }
    }

    function drawPixel(data) {
        const [x, y, color] = data;
        const { r, g, b } = color;

        const imageData = sharedCanvas.current.imageData;
        const screenSize = 256;

        const px = (y * screenSize + x) * 4;

        imageData.data[px] = r;
        imageData.data[px + 1] = g;
        imageData.data[px + 2] = b;
        imageData.data[px + 3] = 255;
    }

    function drawCharacter(data, backgroundColor, scrollX, scrollY, text) {
        const [x, y, ascii, color] = data;

        const imageData = sharedCanvas.current.imageData;

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
            
            const firstHalf = text[character.bits + i * 2];
            const secondHalf = text[character.bits + i * 2 + 1];
                
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

        const imageData = sharedCanvas.current.imageData;

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
        ctxRef.current.putImageData(sharedCanvas.current.imageData, 0, 0);
    }
    
    return(
        <div
            className="display"
            style={style}
        >
            <div className="display-canvas-holder">
                <canvas ref={canvasRef}></canvas>
                <strong ref={canvasStrongRef}>Assembly Reality</strong>
            </div>

            <div className="display-mini-display">
                {assembler.ram.matrix.arrayify({ miniDisplay: true }).map((element, index) => {
                    return <p
                        key={index}
                        className="display-mini-display-element"
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
                    <div className="display-keyboard-image-holder display-keyboard-group">
                        <img
                            src={images.keyboardIcon}
                            alt="KEYBOARD"
                            className="display-keyboard-group"
                            style={keyboard.isActive ? { opacity: "0" } : {}}
                        />

                        <img
                            src={images.keyboardBlueIcon}
                            alt="KEYBOARD"
                            className="display-keyboard-group"
                            style={keyboard.isActive ? { opacity: "1" } : {}}
                        />
                    </div>

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