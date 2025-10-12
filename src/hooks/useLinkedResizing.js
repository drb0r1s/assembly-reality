import { useEffect } from "react"

export const useLinkedResizing = ({ headerRef, elementRef, holderRef, collisionRefs }) => {
    const headerHeight = 27;
    
    useEffect(() => {
        let startY = 0;

        let startHeight = 0;
        let holderHeight = 0;
        
        const handleMouseDown = e => {  
            startY = e.clientY;

            startHeight = elementRef.current.offsetHeight;
            holderHeight = holderRef.current.offsetHeight;

            document.body.style.userSelect = "none";
            
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        const handleMouseMove = e => {
            const deltaY = (e.clientY - startY) * -1;
            
            const currentTop = elementRef.current.getBoundingClientRect().top;
            let blockCurrent = false;

            if(collisionRefs.prev) {
                const prevTop = collisionRefs.prev.current.getBoundingClientRect().top;
                let blockPrev = false;

                if(collisionRefs.doublePrev) {
                    const doublePrevTop = collisionRefs.doublePrev.current.getBoundingClientRect().top;
                    
                    if(prevTop < doublePrevTop + headerHeight) {
                        let newHeight = startHeight + deltaY + 2 * headerHeight;
                        
                        if(newHeight > holderHeight) {
                            newHeight = holderHeight;
                            blockPrev = true;
                        }

                        collisionRefs.doublePrev.current.style.height = `${newHeight}px`;
                    }
                }

                if(blockPrev) blockCurrent = true;

                if(!blockPrev && (currentTop < prevTop + headerHeight)) {
                    let newHeight = startHeight + deltaY + headerHeight;

                    if(newHeight > holderHeight) {
                        newHeight = holderHeight;
                        blockCurrent = true;
                    }

                    collisionRefs.prev.current.style.height = `${newHeight}px`;
                }
            }

            if(collisionRefs.next) {
                const nextTop = collisionRefs.next.current.getBoundingClientRect().top;
                let blockNext = false;

                if(collisionRefs.doubleNext) {
                    const doubleNextTop = collisionRefs.doubleNext.current.getBoundingClientRect().top;
                    
                    if(nextTop + headerHeight > doubleNextTop) {
                        let newHeight = startHeight + deltaY - 2 * headerHeight;

                        if(newHeight < headerHeight) {
                            newHeight = headerHeight;
                            blockNext = true;
                        }
                        
                        collisionRefs.doubleNext.current.style.height = `${newHeight}px`;
                    }
                }

                if(blockNext) blockCurrent = true;

                if(!blockNext && (currentTop + headerHeight > nextTop)) {
                    let newHeight = startHeight + deltaY - headerHeight;

                    if(newHeight < headerHeight) {
                        newHeight = headerHeight;
                        blockCurrent = true;
                    }
                    
                    collisionRefs.next.current.style.height = `${newHeight}px`;
                }
            }

            if(!blockCurrent) {
                let newHeight = startHeight + deltaY;

                if(newHeight > holderHeight) newHeight = holderHeight;
                if(newHeight < headerHeight) newHeight = headerHeight;

                elementRef.current.style.height = `${newHeight}px`;
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