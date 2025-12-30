import { AssemblerError } from "../AssemblerError";

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
        
        Atomics.store(this.registers, this.getIndex(register), value);

        // IO Register TMRCOUNTER updates too fast, there is not a real point in showing that real-time.
        // For that register, it is fine to rely on the standard updating system.
        if(register !== "TMRCOUNTER") self.postMessage({ action: "ioRegistersUpdate" });
    }

    reset() {
        for(let i = 0; i < this.registers.length; i++) {
            Atomics.store(this.registers, i, 0);
        }
    }
};