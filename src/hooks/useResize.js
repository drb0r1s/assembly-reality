import { useState, useEffect } from "react";

export const useResize = () => {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const updateWidth = () => setWidth(window.innerWidth);

        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    return width;
}