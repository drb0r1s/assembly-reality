import { useMemo } from "react";
import MemoryCanvas from "./MemoryCanvas";

const MemoryMatrix = ({ ram }) => {    
    const memoryMatrixColumns = useMemo(() => ["empty", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"], []);
    
    const memoryMatrixRows = useMemo(() => {
        return Array.from({ length: 0x102 }, (_, i) =>
            i.toString(16).toUpperCase().padStart(3, "0")
        );
    }, []);

    return (
        <div className="memory-matrix">
            <div className="memory-matrix-columns">
                {memoryMatrixColumns.map(column => {
                    if (column === "empty") return <span key={column}></span>;
                    return <span key={column}>{column}</span>;
                })}
            </div>

            <div className="memory-matrix-content">
                <div className="memory-matrix-rows">
                    {memoryMatrixRows.map(row => {
                        return <span key={row}>{row}</span>;
                    })}
                </div>

                <MemoryCanvas ram={ram} />
            </div>
        </div>
    );
}

export default MemoryMatrix;