import { Assembler } from "../assembler/Assembler";
import { Interrupts } from "../assembler/Interrupts";

let assembler = null;

self.onmessage = async e => {
    const { action, payload } = e.data;

    let result = null;

    switch(action) {
        case "init":
            // Since we use SharedArrayBuffer class in order to use the same memory reference on both threads, it is important to pass that buffer into the assembler, before performing anything else.
            assembler = new Assembler(payload.cpuRegistersBuffer, payload.ioRegistersBuffer, payload.memoryBuffer);
            
            break;
        case "assemble":
            result = assembler.assemble(payload); // payload: code
            
            if(result?.error) self.postMessage({ action, error: result.error });
            else self.postMessage({ action, data: result });

            break;
        // IMPORTANT: The only purpose of the action "run" is to start the execution and to detect the potential errors.
        // All interactions with the UI are done using "instructionExecuted" action.
        case "run":
            // This method is asynchronous, because of the speed simulation.
            result = await assembler.execute(payload); // payload: speed

            if(result?.error) self.postMessage({ action, error: result.error });
            else self.postMessage({ action, data: result });

            break;
        case "pause":
            result = assembler.pause();

            if(result?.error) self.postMessage({ action, error: result.error });
            else self.postMessage({ action, data: result });

            break;
        case "reset":
            assembler.reset();
            self.postMessage({ action, data: null });

            break;
        case "ioRegistersKeyboard":
            Interrupts.trigger(assembler, "keyboard");
            break;
    }
};