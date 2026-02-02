import { useEffect, useRef, useContext, useMemo } from "react";
import { GlobalContext } from "../../context/GlobalContext";
import { useManagerValue } from "../../hooks/useManagerValue";
import { Manager } from "../../helpers/Manager";
import { MemoryRenderer } from "../../helpers/MemoryRenderer";

const MemoryCanvas = ({ ram }) => {
    const { assembler } = useContext(GlobalContext);

    const canvasRef = useRef(null);
    const rendererRef = useRef(null);
    const hoveredCellRef = useRef(-1);

    const cellProps = useMemo(() => { return {
        height: 20,
        width: 24,
        rows: 258,
        columns: 16
    }}, []);

    const theme = useManagerValue("theme");
    const isMemoryEmpty = useManagerValue("isMemoryEmpty");
    const registerColoring = useManagerValue("registerColoring");

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const dpr = window.devicePixelRatio || 1;

        const cssWidth = cellProps.width * cellProps.columns;
        const cssHeight = cellProps.height * cellProps.rows;

        // CSS size
        canvas.style.width = cssWidth + "px";
        canvas.style.height = cssHeight + "px";

        // Actual pixel buffer
        canvas.width = cssWidth * dpr;
        canvas.height = cssHeight * dpr;

        // Normalize coordinate system
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        rendererRef.current = new MemoryRenderer(canvas, ctx, assembler, ram, cellProps, hoveredCellRef.current, theme, registerColoring);
        rendererRef.current.render();
    }, [assembler, ram, theme, registerColoring]);

    function handleClick(e) {
        if(isMemoryEmpty) return;

        const rect = canvasRef.current.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const row = Math.floor(y / cellProps.height);
        const column = Math.floor(x / cellProps.width);

        const cell = row * cellProps.columns + column;

        const line = assembler.lines.collection[cell];
        if(line) Manager.trigger("highlightLine", line);
    }

    function handleMouseMove(e) {
        if(isMemoryEmpty) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const row = Math.floor(y / cellProps.height);
        const column = Math.floor(x / cellProps.width);

        const cell = row * cellProps.columns + column;

        if(cell !== hoveredCellRef.current) {
            hoveredCellRef.current = cell;

            rendererRef.current?.hoverCell(cell);
            rendererRef.current?.render();
        }
    }

    function handleMouseLeave() {
        if(isMemoryEmpty) return;

        hoveredCellRef.current = -1;

        rendererRef.current?.unhoverCell();
        rendererRef.current?.render();
    }
    
    return(
        <canvas
            ref={canvasRef}
            className="memory-canvas"
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        />
    );
}

export default MemoryCanvas;