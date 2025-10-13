import { useEffect } from "react"

export const useLinkedResizing = ({ headerRef, elementRef, holderRef, collisionRefs }) => {
    const headerHeight = 27;
    
    useEffect(() => {
        const y = { start: 0, last: 0 };
        const heights = { start: 0, holder: 0 };

        const tops = {
            element: null,
            prev: null,
            doublePrev: null,
            next: null,
            doubleNext: null
        };

        let lockElement = [];

        const handleMouseDown = e => {
            y.start = e.clientY;

            heights.start = elementRef.current.offsetHeight;
            heights.holder = holderRef.current.offsetHeight;

            tops.element = elementRef.current.offsetTop;
            tops.prev = collisionRefs?.prev?.current.offsetTop;
            tops.doublePrev = collisionRefs?.doublePrev?.current.offsetTop;
            tops.next = collisionRefs?.next?.current.offsetTop;
            tops.doubleNext = collisionRefs?.doubleNext?.current.offsetTop;

            document.body.style.userSelect = "none";
            
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        const handleMouseMove = e => {
            const deltaY = (e.clientY - y.start) * -1;
            const direction = e.clientY > y.last ? "down" : "up";

            y.last = e.clientY;
            
            if(collisionRefs.prev) {
                if(collisionRefs.doublePrev) {
                    if(lockElement.includes("doublePrev") && direction === "down") unlock("doublePrev");

                    else if(lockElement.includes("doublePrev") || (tops.prev < tops.doublePrev + headerHeight)) {
                        let newHeight = heights.start + deltaY + 2 * headerHeight;
                        lockElement.push("doublePrev");

                        if(newHeight > heights.holder) newHeight = heights.holder;

                        collisionRefs.doublePrev.current.style.height = `${newHeight}px`;
                        tops.doublePrev = collisionRefs.doublePrev.current.offsetTop;
                    }
                }
                
                if(lockElement.includes("prev") && direction === "down") unlock("prev");
                
                else if(lockElement.includes("prev") || (tops.element < tops.prev + headerHeight)) {
                    let newHeight = heights.start + deltaY + headerHeight;
                    lockElement.push("prev");

                    const multiply = collisionRefs.doublePrev ? 1 : 0;
                    if(newHeight > heights.holder - multiply * headerHeight) newHeight = heights.holder - multiply * headerHeight;

                    collisionRefs.prev.current.style.height = `${newHeight}px`;
                    tops.prev = collisionRefs.prev.current.offsetTop;
                }
            }

            if(collisionRefs.next) {
                if(collisionRefs.doubleNext) {
                    if(lockElement.includes("doubleNext") && direction === "up") unlock("doubleNext");

                    else if(lockElement.includes("doubleNext") || (tops.next + headerHeight > tops.doubleNext)) {
                        let newHeight = heights.start + deltaY - 2 * headerHeight;
                        lockElement.push("doubleNext");

                        if(newHeight < headerHeight) newHeight = headerHeight;

                        collisionRefs.doubleNext.current.style.height = `${newHeight}px`;
                        tops.doubleNext = collisionRefs.doubleNext.current.offsetTop;
                    }
                }
                
                if(lockElement.includes("next") && direction === "up") unlock("next");

                else if(lockElement.includes("next") || (tops.element + headerHeight > tops.next)) {
                    let newHeight = heights.start + deltaY - headerHeight;
                    lockElement.push("next");

                    const multiply = collisionRefs.doubleNext ? 2 : 1;
                    if(newHeight < multiply * headerHeight) newHeight = multiply * headerHeight;

                    collisionRefs.next.current.style.height = `${newHeight}px`;
                    tops.next = collisionRefs.next.current.offsetTop;
                }
            }

            let newHeight = heights.start + deltaY;

            const multiplyPrev = collisionRefs.doublePrev ? 2 : 1;
            const multiplyNext = collisionRefs.doubleNext ? 3 : 2;
            
            if(newHeight > heights.holder - multiplyPrev * headerHeight) newHeight = heights.holder - multiplyPrev * headerHeight;
            if(newHeight < multiplyNext * headerHeight) newHeight = multiplyNext * headerHeight;

            elementRef.current.style.height = `${newHeight}px`;
            tops.element = elementRef.current.offsetTop;

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
    }, [headerRef]);
}