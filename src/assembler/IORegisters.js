import { AssemblerError } from "./AssemblerError";

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
        Atomics.store(this.registers, this.getIndex(register), value & 0xFFFF); // We want to keep our register 16-bit.
    }

    // KEYDOWN event affects the KBDSTATUS registers by adding 1.
    keydown(character) {
        const newKbdStatus = (this.getValue("KBDSTATUS") & ~0b010) | 0b001; // We want to clear possible KEYUP event that was left in the register, so we XOR it.
        
        this.update("KBDSTATUS", newKbdStatus, { force: true });
        this.update("KBDDATA", character, { force: true });
    }

    // KEYUP event affects the KBDSTATUS registers by adding 2.
    keyup() {
        let newKbdStatus = (this.getValue("KBDSTATUS") & ~0b001) | 0b010; // We want to clear the KEYDOWN event that was left in the register, so we XOR it.
        if(this.getValue("KBDDATA") > 0) newKbdStatus |= 0b100;
        
        this.update("KBDSTATUS", newKbdStatus, { force: true });
    }

    reset() {
        for(let i = 0; i < this.registers.length; i++) {
            Atomics.store(this.registers, i, 0);
        }
    }
};