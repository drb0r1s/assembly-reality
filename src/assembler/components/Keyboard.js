import { Interrupts } from "../helpers/Interrupts";

export class Keyboard {
    constructor(assembler) {
        this.assembler = assembler;
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

            Interrupts.trigger(this.assembler, "keyboard");
        }
    }

    // KEYDOWN event affects the KBDSTATUS register by adding 1.
    keydown(character) {
        const kbdStatus = this.assembler.ioRegisters.getValue("KBDSTATUS");
        let newKbdStatus = 0;

        // Here we need to check if U or D are active, in order to set the E (overflow).
        if((kbdStatus & 0b011) !== 0) newKbdStatus |= 0b100;
        newKbdStatus |= 0b001;

        this.assembler.ioRegisters.update("KBDSTATUS", newKbdStatus, { force: true });
        this.assembler.ioRegisters.update("KBDDATA", character, { force: true });
    }

    // KEYUP event affects the KBDSTATUS register by adding 2.
    keyup(character) {
        const kbdStatus = this.assembler.ioRegisters.getValue("KBDSTATUS");
        let newKbdStatus = 0;

        // Here we need to check if U or D are active, in order to set the E (overflow).
        if((kbdStatus & 0b011) !== 0) newKbdStatus |= 0b100;
        newKbdStatus |= 0b010;

        this.assembler.ioRegisters.update("KBDSTATUS", newKbdStatus, { force: true });
        this.assembler.ioRegisters.update("KBDDATA", character, { force: true });
    }

    reset() {
        this.events = [];
    }
}