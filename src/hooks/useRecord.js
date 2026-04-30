import { useState, useRef, useCallback } from "react";

export const useRecord = ({ canvasRef }) => {
    const isRecordingRef = useRef(false);
    const recorderRef = useRef(null);
    const chunksRef = useRef([]);

    const handleRecord = useCallback(() => {
        if(canvasRef.current === null) return;
        
        // Start recording.
        if(!isRecordingRef.current) {
            const canvas = canvasRef.current;
            chunksRef.current = [];

            const stream = canvas.captureStream(30);
            const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });

            recorder.ondataavailable = e => chunksRef.current.push(e.data);

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "video/webm" });

                const recording = document.createElement("a");

                recording.href = URL.createObjectURL(blob);
                recording.download = "assembly-reality-recording.webm";

                recording.click();

                URL.revokeObjectURL(recording.href);
            };

            recorder.start();
            recorderRef.current = recorder;

            isRecordingRef.current = true;
        }
        
        // Stop recording.
        else {
            recorderRef.current?.stop();
            isRecordingRef.current = false;
        }
    }, [canvasRef]);

    return { handleRecord };
}