import { Stack } from "../structures/Stack";

export class Interrupts {
    constructor(assembler) {
        this.assembler = assembler;
        this.stack = new Stack(this.assembler.cpuRegisters, this.assembler.ram);
    }

    trigger(type) {
        const mFlag = (this.assembler.cpuRegisters.getValue("SR") >> 4) & 1; // M is the 5th LSB in SR.
        const irqMask = this.assembler.ioRegisters.getValue("IRQMASK");

        if(mFlag === 0 || !checkIRQMASK()) return;

        // 1. The bit in the IRQSTATUS register corresponding to the requesting device is set to 1.
        switch(type) {
            case "keyboard":
                this.assembler.ioRegisters.update("IRQSTATUS", this.assembler.ioRegisters.getValue("IRQSTATUS") | 0b001, { force: true });
                break;
            case "timer":
                this.assembler.ioRegisters.update("IRQSTATUS", this.assembler.ioRegisters.getValue("IRQSTATUS") | 0b010, { force: true });
                break;
            case "graphics":
                this.assembler.ioRegisters.update("IRQSTATUS", this.assembler.ioRegisters.getValue("IRQSTATUS") | 0b100, { force: true });
                break;
        }

        this.process();

        function checkIRQMASK() {
            switch(type) {
                case "keyboard": return irqMask & 1; // 1st LSB
                case "timer": return (irqMask >> 1) & 1; // 2nd LSB
                case "graphics": return (irqMask >> 2) & 1; // 3rd LSB
            }
        }
    }

    async process() {
        // 2. If interrupts are enabled globally (M = 1) and interrupts for the requesting device are also enabled in the IRQMASK register:

        // (a) If the processor is at halt (H = 1), the halt flag is cleared (H = 0) and the processor becomes active.
        const hFlag = this.assembler.cpuRegisters.getValue("SR") & 1;
        
        if(hFlag) {
            this.assembler.isHalted = false;
            this.assembler.cpuRegisters.update("SR", this.assembler.cpuRegisters.getValue("SR") & 0b11110);
        }

        // (b) The status register and the return address (IP) are pushed to the stack in this order.
        this.stack.push(this.assembler.cpuRegisters.getValue("SR"));
        this.stack.push(this.assembler.cpuRegisters.getValue("IP"));

        // (c) Interrupts get disabled globally (M = 0). This way interrupt nesting is prevented.
        this.assembler.cpuRegisters.update("SR", this.assembler.cpuRegisters.getValue("SR") & 0b01111);

        // (d) The processor jumps to address 0x0003 (interrupt vector).
        this.assembler.cpuRegisters.update("IP", 0x0003);

        // IMPORTANT: If H was 1, the code is no longer being executed!
        // In that case, we need to restart the execution process.
        // Also, to make sure that UI is updated properly, we need to send a message to the main UI, once .execute() is done (the same reason why we do it in assemblerWorker's "run").
        if(hFlag) {
            let result = await this.assembler.execute(this.assembler.speed);

            if(result?.error) self.postMessage({ action, error: result.error });
            else self.postMessage({ action: "run", data: result });
        }
    }

    checkTimer() {
        if(!this.assembler.isTimerActive) return;

        const tmrCounter = this.assembler.ioRegisters.getValue("TMRCOUNTER");
        
        if(tmrCounter === 0) {
            this.trigger("timer");
            this.assembler.ioRegisters.update("TMRCOUNTER", this.assembler.ioRegisters.getValue("TMRPRELOAD"), { force: true });
        }

        else this.assembler.ioRegisters.update("TMRCOUNTER", tmrCounter - 1, { force: true });
    }
}