import { AssemblerError } from "./AssemblerError";
import { Interrupts } from "./Interrupts";

const allRegisters = [
    "IRQMASK", "IRQSTATUS", "IRQEOI",
    "TMRPRELOAD", "TMRCOUNTER",
    "KBDSTATUS", "KBDDATA",
    "VIDMODE", "VIDADDR", "VIDDATA",
    "RNDGEN"
];

const readOnly = {
    IRQMASK: false,
    IRQSTATUS: true,
    IRQEOI: false,

    TMRPRELOAD: false,
    TMRCOUNTER: true,

    KBDSTATUS: true,
    KBDDATA: true,

    VIDMODE: false,
    VIDADDR: false,
    VIDDATA: false,

    RNDGEN: true
};

export class IORegisters {
    constructor(ioRegistersBuffer) {
        this.registers = new Uint16Array(ioRegistersBuffer);
        this.registerIndexes = {};

        allRegisters.forEach((register, index) => { this.registerIndexes[register] = index });
    }

    construct() {
        let constructed = {};

        for(let i = 0; i < allRegisters.length; i++) {
            const register = allRegisters[i];
            constructed[register] = this.getValueByIndex(i);
        }

        return constructed;
    }

    get(index) {
        return allRegisters[index];
    }

    getIndex(register) {
        return this.registerIndexes[register];
    }

    getValue(register) {
        return this.getValueByIndex(this.getIndex(register));
    }

    getValueByIndex(index) {
        return Atomics.load(this.registers, index);
    }

    // options.force is used to give a permission to the method to edit read-only registers.
    update(register, value, options) {
        if(readOnly[register] && !options?.force) throw new AssemblerError("ReadOnlyRegisterUpdate", { register });
        
        if(register === "VIDDATA") value &= 0xFF; // VIDDATA should ignore the upper 8bits for now.
        Atomics.store(this.registers, this.getIndex(register), value);

        // IO Register TMRCOUNTER updates too fast, there is not a real point in showing that real-time.
        // For that register, it is fine to rely on the standard updating system.
        if(register !== "TMRCOUNTER") self.postMessage({ action: "ioRegistersUpdate" });
    }

    // KEYDOWN event affects the KBDSTATUS register by adding 1.
    keydown(character) {
        const kbdStatus = this.getValue("KBDSTATUS");
        let newKbdStatus = 0;

        // Here we need to check if U or D are active, in order to set the E (overflow).
        if((kbdStatus & 0b011) !== 0) newKbdStatus |= 0b100;
        newKbdStatus |= 0b001;

        this.update("KBDSTATUS", newKbdStatus, { force: true });
        this.update("KBDDATA", character, { force: true });
    }

    // KEYUP event affects the KBDSTATUS register by adding 2.
    keyup(character) {
        const kbdStatus = this.getValue("KBDSTATUS");
        let newKbdStatus = 0;

        // Here we need to check if U or D are active, in order to set the E (overflow).
        if((kbdStatus & 0b011) !== 0) newKbdStatus |= 0b100;
        newKbdStatus |= 0b010;

        this.update("KBDSTATUS", newKbdStatus, { force: true });
        this.update("KBDDATA", character, { force: true });
    }

    reset() {
        for(let i = 0; i < this.registers.length; i++) {
            Atomics.store(this.registers, i, 0);
        }
    }
};