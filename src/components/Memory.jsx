const Memory = () => {
    const memoryMapColumns = ["empty", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    
    const memoryMapRows = Array.from({ length: 0x102 }, (_, i) => {
        let hexNumber = i.toString(16).toUpperCase();

        if(hexNumber.length === 1) hexNumber = "00" + hexNumber;
        if(hexNumber.length === 2) hexNumber = "0" + hexNumber;

        return hexNumber;
    });

    const memoryMapMatrix = Array.from({ length: 258 }, () => Array.from({ length: 16 }, () => "00"));

    return(
        <div className="memory">
            <div className="memory-header">
                <strong>Memory</strong>
                <button>Split</button>
            </div>

            <div className="memory-map">
                <div className="memory-map-columns">
                    {memoryMapColumns.map(column => {
                        if(column === "empty") return <p key={column}></p>;
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
                        {memoryMapMatrix.map((row, rowIndex) => {
                            return <div
                                key={`row-${rowIndex}`}
                                className="memory-map-matrix-row"
                            >
                                {row.map((column, columnIndex) => {
                                    return <p
                                        key={`column-${columnIndex}`}
                                        className="memory-map-matrix-column"
                                    >{column}</p>;
                                })}
                            </div>;
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Memory;