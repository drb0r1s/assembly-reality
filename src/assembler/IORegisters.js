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

    update(register, value) {
        if(readOnly[register]) throw new AssemblerError("ReadOnlyRegisterUpdate", { register });
        this[register] = value & 0xFFFF; // We want to keep our register 16-bit.
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