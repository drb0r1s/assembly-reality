import { useContext, useMemo, useCallback } from "react";
import { GlobalContext } from "../../context/GlobalContext";
import MemoryCell from "./MemoryCell";
import { Manager } from "../../helpers/Manager";

const MemoryMap = ({ ram, isSplitActive }) => {
    const { assembler } = useContext(GlobalContext);

    const matrix = assembler.ram.matrix.getMatrix();

    const SP = assembler.cpuRegisters.getValue("SP");
    const IP = assembler.cpuRegisters.getValue("IP");
    
    const memoryMapColumns = useMemo(() => ["empty", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"], []);
    
    const memoryMapRows = useMemo(() => {
        return Array.from({ length: 0x102 }, (_, i) =>
            i.toString(16).toUpperCase().padStart(3, "0")
        );
    }, []);

    const cellClassMap = useMemo(() => {
        const map = new Array(matrix.length).fill("");

        for(let i = 0x1000; i <= 0x101F; i++) {
            map[i] = "memory-map-matrix-element-display";
        }

        for(const instruction of ram.instructions) {
            map[instruction] = "memory-map-matrix-element-instruction";
        }

        for(let address = SP + 1; address <= ram.stackStart; address++) {
            map[address] = "memory-map-matrix-element-stack";
        }

        map[IP] = "memory-map-matrix-element-instruction-pointer";
        map[SP] = "memory-map-matrix-element-stack-pointer";

        return map;
    }, [SP, IP, ram.stackStart, ram.instructions]);

    const hexTable = useMemo(() => {
        return Array.from({ length: 256 }, (_, i) =>
            i.toString(16).toUpperCase().padStart(2, "0")
        );
    }, []);

    const highlightLine = useCallback((index) => {
        const line = assembler.lines.collection[index];
        Manager.trigger("highlightLine", line);
    }, [assembler]);

    const handleMatrixClick = useCallback(e => {
        const index = e.target.dataset.index;
        highlightLine(Number(index));
    }, [highlightLine]);

    return (
        <div
            className="memory-map"
            //style={isSplitActive ? { height: "50%" } : {}}
        >
            <div className="memory-map-columns">
                {memoryMapColumns.map(column => {
                    if (column === "empty") return <p key={column}></p>;
                    return <p key={column}>{column}</p>;
                })}
            </div>

            <div className="memory-map-content">
                <div className="memory-map-rows">
                    {memoryMapRows.map(row => {
                        return <p key={row}>{row}</p>;
                    })}
                </div>

                <div
                    className="memory-map-matrix"
                    onClick={handleMatrixClick}
                >
                    {Array.from({ length: matrix.length }, (_, index) => {
                        const element = matrix[index];

                        return <MemoryCell
                            key={index}
                            value={hexTable[element]}
                            className={`memory-map-matrix-element ${cellClassMap[index]}`}
                            index={index}
                        />;
                    })}
                </div>
            </div>
        </div>
    );
}

export default MemoryMap;