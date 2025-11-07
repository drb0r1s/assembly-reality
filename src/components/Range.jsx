import { useState, useEffect, useRef } from "react";

const Range = ({ value, min, max, onDrag }) => {
    const [range, setRange] = useState({ position: 0, percent: 0 });
    const rangeLineRef = useRef(null);

    const circleWidth = 20;

    useEffect(() => {
        if (!rangeLineRef.current) return;

        const rect = rangeLineRef.current.getBoundingClientRect();
        const usableWidth = rect.width - circleWidth;

        const newPercent = (Math.log(value / min) / Math.log(max / min)) * 100;
        const newPosition = (usableWidth * newPercent) / 100;

        setRange({ position: newPosition, percent: newPercent });
    }, [value]);

    function handleDrag(e) {
        calculateValue(e);
        document.body.style.userSelect = "none";
        
        window.addEventListener("mousemove", handleDrag);
        
        window.addEventListener("mouseup", () => {
            window.removeEventListener("mousemove", handleDrag);
            document.body.style.userSelect = "";
        }, { once: true });

        function calculateValue() {
            const rect = rangeLineRef.current.getBoundingClientRect();
            const usableWidth = rect.width - circleWidth;
            
            let x = e.clientX - rect.left;
            x = Math.max(0, Math.min(x, usableWidth));

            const newPercent = (x / usableWidth) * 100;

            setRange({ position: x, percent: newPercent });

            const frequency = min * Math.pow(max / min, newPercent / 100);
            onDrag(frequency);
        }
    }
    
    return(
        <div
            className="range"
            onMouseDown={handleDrag}
        >
            <div className="range-line" ref={rangeLineRef}></div>
            
            <div
                className="range-filled-line"
                style={{ width: `${range.percent}%` }}
            ></div>
            
            <div
                className="range-circle"
                style={{ left: `${range.position}px` }}
            ></div>
        </div>
    );
}

export default Range;