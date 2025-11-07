import { Assembler } from "../assembler/Assembler";

const assembler = new Assembler();

self.onmessage = async e => {
    const { action, payload } = e.data;

    let result = null;

    switch(action) {
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
        case "reset":
            result = assembler.reset();
            self.postMessage({ action, data: result });

            break;
    }
};