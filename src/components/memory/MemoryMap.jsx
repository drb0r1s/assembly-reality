const MemoryMap = ({ memoryMatrix, memoryInstructions, isSplitActive }) => {
    const memoryMapColumns = ["empty", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    
    const memoryMapRows = Array.from({ length: 0x102 }, (_, i) => {
        return i.toString(16).toUpperCase().padStart(3, "0");
    });

    function getInstructionClass(index) {
        if(memoryInstructions.list[memoryInstructions.index] === index) return "memory-map-matrix-element-current-instruction";
        if(memoryInstructions.list.indexOf(index) > -1) return "memory-map-matrix-element-instruction";

        return "";
    }

    return (
        <div
            className="memory-map"
            style={isSplitActive ? { height: "50%" } : {}}
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

                <div className="memory-map-matrix">
                    {[...memoryMatrix].map((element, index) => {
                        return <p
                            key={index}
                            className={`memory-map-matrix-element ${getInstructionClass(index)}`}
                        >{element.toString(16).toUpperCase().padStart(2, "0")}</p>;
                    })}
                </div>
            </div>
        </div>
    );
}

export default MemoryMap;