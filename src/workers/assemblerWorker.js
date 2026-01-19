import { Assembler } from "../assembler/Assembler";

let assembler = null;

self.onmessage = async e => {
    const { action, data } = e.data;

    let result = null;

    switch(action) {
        case "init":
            // Since we use SharedArrayBuffer class in order to use the same memory reference on both threads, it is important to pass that buffer into the assembler, before performing anything else.
            assembler = new Assembler(data.cpuRegistersBuffer, data.ioRegistersBuffer, data.ramBuffer, data.graphicsBuffer);
            
            break;
        case "assemble":
            result = assembler.assemble(data); // data: code
            
            if(result?.error) self.postMessage({ action, error: result.error });
            else self.postMessage({ action, data: result });

            break;
        // IMPORTANT: The only purpose of the action "run" is to start the execution and to detect the potential errors.
        // All interactions with the UI are done using "instructionExecuted" action.
        case "run":
            // This method is asynchronous, because of the speed simulation.
            result = await assembler.execute(data); // data: speed

            if(result?.error) self.postMessage({ action, error: result.error });
            else self.postMessage({ action, data: result });

            break;
        case "assembleRun":
            const { code, speed } = data;

            result = assembler.assemble(code);
            if(result?.error) self.postMessage({ action, error: result.error });

            result = await assembler.execute(speed);
            
            if(result?.error) self.postMessage({ action, error: result.error });
            else self.postMessage({ action, data: result });

            break;
        case "pause":
            result = assembler.pause();

            if(result?.error) self.postMessage({ action, error: result.error });
            else self.postMessage({ action, data: result });

            break;
        case "step":
            result = assembler.executeOne();

            if(result?.error) self.postMessage({ action, error: result.error });
            else self.postMessage({ action, data: result });
                        
            break;
        case "reset":
            assembler.reset();
            self.postMessage({ action, data: null });

            break;
        case "ioRegistersKeyboard":
            assembler.interrupts.trigger("keyboard");
            break;
        case "keyboardEvent":
            assembler.keyboard.addEvent(data); // data: { type, key }
            break;
    }
};