import { useRef } from "react"

export const useSharedCanvas = () => {
    return useRef({ imageData: null });
}