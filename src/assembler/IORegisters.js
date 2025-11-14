import { AssemblerError } from "./AssemblerError";

const addressRegister = [
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
    constructor() {
        this.IRQMASK = 0x0000;
        this.IRQSTATUS = 0x0000;
        this.IRQEOI = 0x0000;
        
        this.TMRPRELOAD = 0x0000;
        this.TMRCOUNTER = 0x0000;

        this.KBDSTATUS = 0x0000;
        this.KBDDATA = 0x0000;

        this.VIDMODE = 0x0000;
        this.VIDADDR = 0x0000;
        this.VIDDATA = 0x0000;

        this.RNDGEN = 0x0000;
    }

    get(index) {
        return addressRegister[index];
    }

    getValue(register) {
        return this[register];
    }

    getValueByIndex(index) {
        const register = this.get(index);
        return this.getValue(register);
    }

    // options.force is used to give a permission to the method to edit read-only registers.
    update(register, value, options) {
        if(readOnly[register] && !options?.force) throw new AssemblerError("ReadOnlyRegisterUpdate", { register });
        this[register] = value & 0xFFFF; // We want to keep our register 16-bit.
    }

    // KEYDOWN event affects the KBDSTATUS registers by adding 1.
    keydown(character) {
        const newKbdStatus = (this.KBDSTATUS & ~0b010) | 0b001; // We want to clear possible KEYUP event that was left in the register, so we XOR it.
        
        this.update("KBDSTATUS", newKbdStatus, { force: true });
        this.update("KBDDATA", character, { force: true });
    }

    // KEYUP event affects the KBDSTATUS registers by adding 2.
    keyup() {
        let newKbdStatus = (this.KBDSTATUS & ~0b001) | 0b010; // We want to clear the KEYDOWN event that was left in the register, so we XOR it.
        if(this.KBDDATA > 0) newKbdStatus |= 0b100;
        
        this.update("KBDSTATUS", newKbdStatus, { force: true });
    }

    copy(ioRegisters) {
        this.IRQMASK = ioRegisters.IRQMASK;
        this.IRQSTATUS = ioRegisters.IRQSTATUS;
        this.IRQEOI = ioRegisters.IRQEOI;
        
        this.TMRPRELOAD = ioRegisters.TMRPRELOAD;
        this.TMRCOUNTER = ioRegisters.TMRCOUNTER;

        this.KBDSTATUS = ioRegisters.KBDSTATUS;
        this.KBDDATA = ioRegisters.KBDDATA;

        this.VIDMODE = ioRegisters.VIDMODE;
        this.VIDADDR = ioRegisters.VIDADDR;
        this.VIDDATA = ioRegisters.VIDDATA;

        this.RNDGEN = ioRegisters.RNDGEN;
    }

    reset() {
        this.IRQMASK = 0x0000;
        this.IRQSTATUS = 0x0000;
        this.IRQEOI = 0x0000;
        
        this.TMRPRELOAD = 0x0000;
        this.TMRCOUNTER = 0x0000;

        this.KBDSTATUS = 0x0000;
        this.KBDDATA = 0x0000;

        this.VIDMODE = 0x0000;
        this.VIDADDR = 0x0000;
        this.VIDDATA = 0x0000;

        this.RNDGEN = 0x0000;
    }
};