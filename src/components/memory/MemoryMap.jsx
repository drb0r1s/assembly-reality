const MemoryMap = ({ memory, registerPointers, isSplitActive }) => {
    const memoryMapColumns = ["empty", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    
    const memoryMapRows = Array.from({ length: 0x102 }, (_, i) => {
        return i.toString(16).toUpperCase().padStart(3, "0");
    });

    function getCellClass(index) {
        // Stack classes should take priority over the instruction classes.

        // STACK CLASSES
        if(registerPointers.SP === index) return "memory-map-matrix-element-stack-pointer";
        if(registerPointers.SP < index && index <= memory.stackStart) return "memory-map-matrix-element-stack";

        // INSTRUCTION CLASSES
        if(registerPointers.IP === index) return "memory-map-matrix-element-instruction-pointer";
        if(memory.instructions.indexOf(index) > -1) return "memory-map-matrix-element-instruction";

        // DISPLAY CLASSES
        if(index > 0xFFF) return "memory-map-matrix-element-display";

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
                    {[...memory.matrix].map((element, index) => {
                        return <p
                            key={index}
                            className={`memory-map-matrix-element ${getCellClass(index)}`}
                        >{element.toString(16).toUpperCase().padStart(2, "0")}</p>;
                    })}
                </div>
            </div>
        </div>
    );
}

export default MemoryMap;