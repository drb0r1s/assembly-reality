import React from "react";

const MemoryCell = React.memo(({ value, className, index }) => {
    return <p
        className={className}
        data-index={index}
    >{value}</p>;
});

export default MemoryCell;