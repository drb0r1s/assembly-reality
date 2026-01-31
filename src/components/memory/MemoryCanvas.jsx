import { useEffect, useRef, useContext, useMemo } from "react";
import { GlobalContext } from "../../context/GlobalContext";
import { Manager } from "../../helpers/Manager";
import { MemoryRenderer } from "../../helpers/MemoryRenderer";

const MemoryCanvas = ({ ram }) => {
    const { assembler } = useContext(GlobalContext);

    const canvasRef = useRef(null);
    const rendererRef = useRef(null);

    const cell = useMemo(() => { return {
        height: 20,
        width: 24,
        rows: 258,
        columns: 16
    }}, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const dpr = window.devicePixelRatio || 1;

        const cssWidth = cell.width * cell.columns;
        const cssHeight = cell.height * cell.rows;

        // CSS size
        canvas.style.width = cssWidth + "px";
        canvas.style.height = cssHeight + "px";

        // Actual pixel buffer
        canvas.width = cssWidth * dpr;
        canvas.height = cssHeight * dpr;

        // Normalize coordinate system
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        rendererRef.current = new MemoryRenderer(ctx, assembler, ram, cell);
        rendererRef.current.render();

        return () => { rendererRef.current = null; };
    }, [assembler, ram]);

    useEffect(() => {
        rendererRef.current?.render();
    }, [
        assembler.cpuRegisters.getValue("IP"),
        assembler.cpuRegisters.getValue("SP"),
        ram.instructions,
        ram.stackStart
    ]);

    function handleClick(e) {
        const rect = canvasRef.current.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const row = Math.floor(y / cell.height);
        const column = Math.floor(x / cell.width);

        const index = row * cell.columns + column;

        const line = assembler.lines.collection[index];
        if(line) Manager.trigger("highlightLine", line);
    };
    
    return(
        <canvas
            ref={canvasRef}
            className="memory-canvas"
            onClick={handleClick}
        />
    );
}

export default MemoryCanvas;