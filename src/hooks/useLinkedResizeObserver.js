import { useState, useEffect, useMemo } from "react";
import { useResizeObserver } from "./useResizeObserver";
import { useResize } from "./useResize";

export const useLinkedResizeObserver = ({ elements, elementName }) => {
    const [lowerSection, setLowerSection] = useState({ ref: null }); // This state has to contain the elements inside the object, under the ref property, because of the way React is updating ref objects.

    const firstElementRef = elements ? elements.refs[elements.getOrder(elementName)] : null;
    const secondElementRef = elements ? lowerSection.ref : null;

    const elementHeight = useResizeObserver({ elementRef: firstElementRef });
    const lowerSectionHeight = useResizeObserver({ elementRef: secondElementRef });

    const width = useResize();

    const headerHeight = 27;

    const displayHeight = useMemo(() => {
        if(!firstElementRef) return null;
        return elementHeight - lowerSectionHeight - headerHeight;
    }, [elementHeight, lowerSectionHeight]);

    useEffect(() => {
        if(!elements) return;
        setLowerSection({ ref: elements.refs[elements.getOrder(elementName) + 1] });
    }, [elements, width]);

    return displayHeight;
}