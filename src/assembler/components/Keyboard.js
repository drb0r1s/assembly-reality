export class Keyboard {
    constructor(ioRegisters, interrupts) {
        this.ioRegisters = ioRegisters;
        this.interrupts = interrupts;
        this.events = [];
    }

    addEvent(event) {
        this.events.push(event);
    }

    processEvents() {
        while(this.events.length > 0) {
            const event = this.events.shift();

            if(event.type === "keydown") this.keydown(event.character);
            else this.keyup(event.character);

            this.interrupts.trigger("keyboard");
        }

        self.postMessage({ action: "textDisplayPing" });
    }

    // KEYDOWN event affects the KBDSTATUS register by adding 1.
    keydown(character) {
        const kbdStatus = this.ioRegisters.getValue("KBDSTATUS");
        let newKbdStatus = 0;

        // Here we need to check if U or D are active, in order to set the E (overflow).
        if((kbdStatus & 0b011) !== 0) newKbdStatus |= 0b100;
        newKbdStatus |= 0b001;

        this.ioRegisters.update("KBDSTATUS", newKbdStatus, { force: true });
        this.ioRegisters.update("KBDDATA", character, { force: true });
    }

    // KEYUP event affects the KBDSTATUS register by adding 2.
    keyup(character) {
        const kbdStatus = this.ioRegisters.getValue("KBDSTATUS");
        let newKbdStatus = 0;

        // Here we need to check if U or D are active, in order to set the E (overflow).
        if((kbdStatus & 0b011) !== 0) newKbdStatus |= 0b100;
        newKbdStatus |= 0b010;

        this.ioRegisters.update("KBDSTATUS", newKbdStatus, { force: true });
        this.ioRegisters.update("KBDDATA", character, { force: true });
    }

    reset() {
        this.events = [];
    }
}