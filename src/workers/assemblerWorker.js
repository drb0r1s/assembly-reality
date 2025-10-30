import { Assembler } from "../assembler/Assembler";

const assembler = new Assembler();

self.onmessage = e => {
    const { action, payload } = e.data;

    let result = null;

    switch(action) {
        case "assemble":
            result = assembler.assemble(payload);
            
            if(result?.error) self.postMessage({ action, error: result.error });
            else self.postMessage({ action, data: result });

            break;
        case "run":
            result = assembler.execute();

            if(result?.error) self.postMessage({ action, error: result.error });
            else self.postMessage({ action, data: result });

            break;
        case "reset":
            result = assembler.reset();
            self.postMessage({ action, data: result });

            break;
    }
};