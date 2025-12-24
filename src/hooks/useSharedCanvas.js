import { useRef } from "react"

export const useSharedCanvas = () => {
    return useRef({
        imageData: null,
        palette: null // We'll use palette here, just so we don't have to calculate the whole palette on each render of ExpandedDisplay > Display.
    });
}