import { useEffect } from "react";
import { useResize } from "./useResize";
import { useManagerValue } from "./useManagerValue";

export const useLinkedResizing = ({ headerRef, elementRefs, targetIndex, holderRef, conditional }) => {    
    const width = useResize();
    const view = useManagerValue("view");
    
    const headerHeight = 27;
    const mobileHeaderHeight = width < 900 ? 38 : 0;
    
    useEffect(() => {
        if((width < 900 || width >= 1300) && conditional) return;

        const y = { start: 0, last: 0 };
        const heights = { start: 0, holder: 0 };

        let elementTops = [];
        let lockElement = [];

        let activePointerId = null;

        const handlePointerDown = e => {
            y.start = e.clientY;

            heights.start = elementRefs[targetIndex].current.offsetHeight;
            heights.holder = holderRef.current.offsetHeight;

            elementTops = [];
            for(let i = 0; i < elementRefs.length; i++) elementTops.push(elementRefs[i].current.offsetTop);

            lockElement = [];

            document.body.style.userSelect = "none";

            activePointerId = e.pointerId;
            headerRef.current.setPointerCapture(activePointerId);
            
            window.addEventListener("pointermove", handlePointerMove);
            window.addEventListener("pointerup", handlePointerUp);
            window.addEventListener("pointercancel", handlePointerUp);
        }

        const handlePointerMove = e => {
            const deltaY = (e.clientY - y.start) * -1;
            const direction = e.clientY > y.last ? "down" : "up";

            y.last = e.clientY;

            // [PREV, ELEMENT)
            for(let i = 0; i < targetIndex; i++) {
                if(lockElement.includes(i) && direction === "down") unlock(i);

                // SCROLLING UP
                else if(
                    lockElement.includes(i) ||
                    (elementTops[i + 1] < elementTops[i] + headerHeight)
                ) {    
                    let newHeight = heights.start + deltaY + (targetIndex - i) * headerHeight;
                    if(i !== targetIndex) lockElement.push(i);

                    const multiply = i;
                    if(newHeight > (heights.holder - mobileHeaderHeight) - multiply * headerHeight) newHeight = (heights.holder - mobileHeaderHeight) - multiply * headerHeight;
                    
                    elementRefs[i].current.style.height = `${newHeight}px`;
                    elementTops[i] = elementRefs[i].current.offsetTop;
                }
            }

            // (ELEMENT, NEXT]
            for(let i = elementRefs.length - 1; i > targetIndex; i--) {
                if(lockElement.includes(i) && direction === "up") unlock(i);

                // SCROLLING DOWN
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

            // ELEMENT
            let newHeight = heights.start + deltaY;

            if(newHeight > (heights.holder - mobileHeaderHeight) - targetIndex * headerHeight) newHeight = (heights.holder - mobileHeaderHeight) - targetIndex * headerHeight;
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

        const handlePointerUp = () => {
            document.body.style.userSelect = "";

            if(activePointerId !== null) {
                headerRef.current.releasePointerCapture(activePointerId);
                activePointerId = null;
            }

            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerUp);
        }
        
        headerRef.current.addEventListener("pointerdown", handlePointerDown);
        return () => { if(headerRef.current) headerRef.current.removeEventListener("pointerdown", handlePointerDown) }
    }, [view, headerRef, elementRefs]);
}