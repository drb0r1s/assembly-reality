import React from "react";

const MemoryCell = React.memo(({ value, className, index }) => {
    return <span
        className={className}
        data-index={index}
    >{value}</span>;
});

export default MemoryCell;