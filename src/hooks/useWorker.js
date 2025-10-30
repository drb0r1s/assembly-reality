import { useRef } from "react";

export const useWorker = () => {
    const workerRef = useRef(new Worker(
        new URL("../workers/assemblerWorker.js", import.meta.url),
        { type: "module" }
    ));

    return workerRef.current;
}