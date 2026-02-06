import { useState, useEffect, useRef } from "react";
import { useResize } from "../hooks/useResize";

const Range = ({ value, min, max, onDrag }) => {
    const [range, setRange] = useState({ position: 0, percent: 0 });
    
    const rangeLineRef = useRef(null);
    const rangeFilledLineRef = useRef(null);
    const rangeCircleRef = useRef(null);
    const removeTransitionRef = useRef(false);

    const width = useResize();

    const circleWidth = (width < 900 ? 25 : 20);

    useEffect(() => {
        if(!rangeLineRef.current) return;

        const rect = rangeLineRef.current.getBoundingClientRect();
        const usableWidth = rect.width - circleWidth;

        const newPercent = (Math.log(value / min) / Math.log(max / min)) * 100;
        const newPosition = (usableWidth * newPercent) / 100;

        setRange({ position: newPosition, percent: newPercent });
    }, [value]);

    useEffect(() => {
        if(!removeTransitionRef.current) return;

        setTimeout(() => {
            rangeFilledLineRef.current.style.transition = "";
            rangeCircleRef.current.style.transition = "";

            removeTransitionRef.current = false;
        }, 300);
    }, [range]);

    function handleDrag(e) {
        e.stopPropagation();
        
        calculateValue(e, true);
        document.body.style.userSelect = "none";
        
        window.addEventListener("pointermove", handleDrag);
        
        window.addEventListener("pointerup", () => {
            window.removeEventListener("pointermove", handleDrag);
            document.body.style.userSelect = "";
        }, { once: true });
    }

    function calculateValue(e, isDrag = false) {
        const rect = rangeLineRef.current.getBoundingClientRect();
        const usableWidth = rect.width - circleWidth;
            
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(x, usableWidth));

        const newPercent = (x / usableWidth) * 100;

        if(!isDrag) {
            rangeFilledLineRef.current.style.transition = "300ms";
            rangeCircleRef.current.style.transition = "300ms";

            removeTransitionRef.current = true;
        }

        setRange({ position: x, percent: newPercent });

        const frequency = min * Math.pow(max / min, newPercent / 100);
        onDrag(frequency);
    }
    
    return(
        <div
            className="range"
            onPointerDown={calculateValue}
        >
            <div className="range-line" ref={rangeLineRef}></div>
            
            <div
                className="range-filled-line"
                style={{ width: `${range.percent}%` }}
                ref={rangeFilledLineRef}
            ></div>
            
            <div
                className="range-circle"
                style={{ left: `${range.position}px` }}
                ref={rangeCircleRef}
                onPointerDown={handleDrag}
            ></div>
        </div>
    );
}

export default Range;