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

    do() {
        this.slow();
        this.ioRegisters();
        this.keyboard();
        this.graphics();
        this.textDisplay();
    }

    slow(options) {
        if(this.assembler.speed >= 10000) return;

        if(this.slowFlag || options?.force) {
            this.slowFlag = false;
            self.postMessage({ action: "instructionExecuted", data: this.assembler.getAssemblerState() });

            self.postMessage({ action: "ioRegistersSlowPing" });

            if(options?.step) this.graphics();
        }
    }

    triggerSlow() {
        this.slowFlag = true;
    }

    ioRegisters() {
        self.postMessage({ action: "ioRegistersPing" });
    }

    keyboard() {
        const mFlag = this.assembler.cpuRegisters.getSRFlag("M");
        if(mFlag === 1) this.assembler.keyboard.processEvents();
    }

    graphics() {
        const vidMode = this.assembler.ioRegisters.getValue("VIDMODE");

        // Bitmap
        if(vidMode > 1) {
            const storedBits = this.assembler.graphics.getStoredBits();
            if(storedBits.length === 0) return;

            self.postMessage({ action: "graphicsRedraw", data: storedBits });
            this.assembler.graphics.clearStoredBits();
        }
        
        // Text
        if(vidMode === 1) this.assembler.graphics.executeVsync();
    }

    textDisplay() {
        self.postMessage({ action: "textDisplayPing" });
    }

    reset() {
        this.slowFlag = false;
        this.stopInterval();
    }
}