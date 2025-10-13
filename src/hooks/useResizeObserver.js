import { useState, useEffect } from "react"

export const useResizeObserver = ({ elementRef }) => {
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if(!elementRef?.current) return;
        setHeight(elementRef.current.offsetHeight);

        const observer = new ResizeObserver(entries => {
            for(let entry of entries) setHeight(entry.contentRect.height);
        });

        observer.observe(elementRef.current);
        return () => { observer.disconnect() }
    }, [elementRef?.current]);

    return height;
}