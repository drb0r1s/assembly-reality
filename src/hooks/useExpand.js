import { useEffect } from "react"

export const useExpand = ({ headerRef, elementRef }) => {
    useEffect(() => {
        let startY = 0;
        let startHeight = 0;
        
        const handleMouseDown = e => {  
            startY = e.clientY;
            startHeight = elementRef.current.offsetHeight;

            document.body.style.userSelect = "none";
            
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        const handleMouseMove = e => {
            const deltaY = (e.clientY - startY) * -1;
            elementRef.current.style.height = `${startHeight + deltaY}px`;
        }

        const handleMouseUp = () => {
            document.body.style.userSelect = "";

            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }
        
        headerRef.current.addEventListener("mousedown", handleMouseDown);
        return () => { headerRef.current.removeEventListener("mousedown", handleMouseDown) }
    }, [headerRef]);
}