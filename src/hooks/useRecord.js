import { useState, useRef, useCallback, useEffect } from "react";
import { useManagerValue } from "./useManagerValue";

const MIME_TYPE = [
    "video/webm; codecs=vp9",
    "video/webm; codecs=vp8",
    "video/webm",
].find(type => MediaRecorder.isTypeSupported(type));

export const useRecord = ({ canvasRef }) => {
    const recordingIsActive = useManagerValue("recordingIsActive");

    const isRecordingRef = useRef(recordingIsActive);
    const hiddenCanvasRef = useRef(null);
    const recorderRef = useRef(null);
    const chunksRef = useRef([]);

    const handleRecord = useCallback(() => {
        if(canvasRef.current === null) return;
        
        // Start recording.
        if(!isRecordingRef.current) {
            const source = canvasRef.current;
            const scale = 4; // Scalling up classic canvas size of 256px to 1024px.

            // We need to create a hidden canvas that is going to be updated just like a real one, but scaled up.
            const hiddenCanvas = document.createElement("canvas");
            hiddenCanvasRef.current = hiddenCanvas;

            hiddenCanvas.width = source.width * scale;
            hiddenCanvas.height = source.height * scale;

            const ctx = hiddenCanvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;

            chunksRef.current = [];

            const stream = hiddenCanvas.captureStream(30);
            const recorder = new MediaRecorder(stream, { mimeType: MIME_TYPE });

            recorder.ondataavailable = e => chunksRef.current.push(e.data);

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "video/webm" });

                const recordingA = document.createElement("a");

                recordingA.href = URL.createObjectURL(blob);
                recordingA.download = "ary-recording.webm";

                recordingA.click();

                URL.revokeObjectURL(recordingA.href);
            };

            const mirror = () => {
                if(!isRecordingRef.current) return;

                ctx.drawImage(source, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
                requestAnimationFrame(mirror);
            };

            recorder.start();

            recorderRef.current = recorder;
            isRecordingRef.current = true;

            mirror();
        }
        
        // Stop recording.
        else {
            recorderRef.current?.stop();

            isRecordingRef.current = false;
            hiddenCanvasRef.current = null; // This way GC is aware of the element and clears it.
        }
    }, [canvasRef]);

    useEffect(() => { if(isRecordingRef.current !== recordingIsActive) isRecordingRef.current = recordingIsActive }, [recordingIsActive]);

    return { handleRecord };
}