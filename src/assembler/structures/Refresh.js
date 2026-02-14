import { AssemblerError } from "../AssemblerError";

export class Refresh {
    constructor(assembler) {
        this.assembler = assembler;
        this.slowFlag = false;
        this.intervalId = null;
    }

    startInterval() {
        if(this.intervalId !== null) return;
        this.intervalId = setInterval(() => this.do(), 20);
    }

    stopInterval() {
        if(this.intervalId === null) return;

        clearInterval(this.intervalId);
        this.intervalId = null;

        // We need to show anything that wasn't refreshed after ending the interval.
        this.triggerSlow();
        this.do();
    }

    // Force is used in "step" mode.
    do(force = false) {
        try {
            this.slow(force);
            this.ioRegisters();
            this.keyboard();
            this.graphics();
            this.textDisplay();
        }

        catch(error) {
            this.assembler.stop(true);

            if(error instanceof AssemblerError) self.postMessage({ action: "refreshError", error });
            else self.postMessage({ action: "refreshError", error: new AssemblerError("UnknownRefreshError", [], null, this.assembler.cpuRegisters) });
        }
    }

    slow(force = false) {
        if(this.slowFlag || force) {
            this.slowFlag = false;
            
            if(this.assembler.speed < 10000) self.postMessage({ action: "instructionExecuted", data: this.assembler.getAssemblerState() });
            self.postMessage({ action: "ioRegistersSlowPing" });
        }
    }

    triggerSlow() {
        this.slowFlag = true;
    }

    ioRegisters() {
        self.postMessage({ action: "ioRegistersPing" });
    }

    keyboard() {
        this.assembler.keyboard.processEvents();
    }

    graphics() {
        // Clear
        if(this.assembler.ioRegisters.getValue("VIDMODE") === 3) {
            this.assembler.ioRegisters.update("VIDMODE", this.assembler.graphics.mode); // Returning the value of old vidMode (before setting it to 3).
            self.postMessage({ action: "graphicsRedraw", data: "clear" });
        }

        const vidMode = this.assembler.ioRegisters.getValue("VIDMODE");

        // Bitmap
        if(vidMode === 2) {
            const storedBits = this.assembler.graphics.getStoredBits();
            if(storedBits.length === 0) return;

            self.postMessage({ action: "graphicsRedraw", data: storedBits });
            this.assembler.graphics.clearStoredBits();
        }
        
        // Text
        else if(vidMode === 1) this.assembler.graphics.executeVsync();
    }

    textDisplay() {
        self.postMessage({ action: "textDisplayPing" });
    }

    reset() {
        this.slowFlag = false;
        this.stopInterval();
    }
}