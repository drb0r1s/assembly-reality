import { useEffect } from "react";
import { useResize } from "./useResize";
import { useManagerValue } from "./useManagerValue";

export const useLinkedResizing = ({ headerRef, elementRefs, targetIndex, holderRef, conditional }) => {    
    const headerHeight = 27;

    const width = useResize();
    const view = useManagerValue("view");
    
    useEffect(() => {
        if(width >= 1300 && conditional) return;

        const y = { start: 0, last: 0 };
        const heights = { start: 0, holder: 0 };

        let elementTops = [];
        let lockElement = [];

        const handleMouseDown = e => {
            y.start = e.clientY;

            heights.start = elementRefs[targetIndex].current.offsetHeight;
            heights.holder = holderRef.current.offsetHeight;

            elementTops = [];
            for(let i = 0; i < elementRefs.length; i++) elementTops.push(elementRefs[i].current.offsetTop);

            lockElement = [];

            document.body.style.userSelect = "none";
            
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        const handleMouseMove = e => {
            const deltaY = (e.clientY - y.start) * -1;
            const direction = e.clientY > y.last ? "down" : "up";

            y.last = e.clientY;

            for(let i = 0; i <= targetIndex; i++) {
                if(lockElement.includes(i) && direction === "down") unlock(i);

                else if(
                    lockElement.includes(i) ||
                    (elementTops[i + 1] < elementTops[i] + headerHeight)
                ) {    
                    let newHeight = heights.start + deltaY + (targetIndex - i) * headerHeight;
                    if(i !== targetIndex) lockElement.push(i);

                    const multiply = i;
                    if(newHeight > heights.holder - multiply * headerHeight) newHeight = heights.holder - multiply * headerHeight;
                    
                    elementRefs[i].current.style.height = `${newHeight}px`;
                    elementTops[i] = elementRefs[i].current.offsetTop;
                }
            }

            for(let i = elementRefs.length - 1; i >= targetIndex; i--) {
                if(lockElement.includes(i) && direction === "up") unlock(i);

                else if(
                    lockElement.includes(i) ||
                    (elementTops[i - 1] + headerHeight > elementTops[i])
                ) {
                    let newHeight = heights.start + deltaY - (i - targetIndex) * headerHeight;
                    if(i !== targetIndex) lockElement.push(i);

                    const multiply = elementRefs.length - i;
                    if(newHeight < multiply * headerHeight) newHeight = multiply * headerHeight;

                    elementRefs[i].current.style.height = `${newHeight}px`;
                    elementTops[i] = elementRefs[i].current.offsetTop;
                }
            }

            let newHeight = heights.start + deltaY;

            if(newHeight > heights.holder - targetIndex * headerHeight) newHeight = heights.holder - targetIndex * headerHeight;
            if(newHeight < (elementRefs.length - targetIndex) * headerHeight) newHeight = (elementRefs.length - targetIndex) * headerHeight;

            elementRefs[targetIndex].current.style.height = `${newHeight}px`;
            elementTops[targetIndex] = elementRefs[targetIndex].current.offsetTop;

            function unlock(type) {
                const newLockElement = [];

                for(let i = 0; i < lockElement.length; i++) {
                    if(lockElement[i] !== type) newLockElement.push(lockElement[i]);
                }

                lockElement = newLockElement;
            }
        }

        const handleMouseUp = () => {
            document.body.style.userSelect = "";

            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }
        
        headerRef.current.addEventListener("mousedown", handleMouseDown);
        return () => { if(headerRef.current) headerRef.current.removeEventListener("mousedown", handleMouseDown) }
    }, [view, headerRef, elementRefs]);
}