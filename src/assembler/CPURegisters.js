import { ByteNumber } from "./ByteNumber";

const registerIndex = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
    SP: 4,
    IP: 5,
    SR: 6,
    AH: 7,
    AL: 8,
    BH: 9,
    BL: 10,
    CH: 11,
    CL: 12,
    DH: 13,
    DL: 14
};

const indexRegister = {
    0: "A",
    1: "B",
    2: "C",
    3: "D",
    4: "SP",
    5: "IP",
    6: "SR",
    7: "AH",
    8: "AL",
    9: "BH",
    10: "BL",
    11: "CH",
    12: "CL",
    13: "DH",
    14: "DL"
};

export class CPURegisters {
    constructor() {
        this.A = 0x0000;
        this.B = 0x0000;
        this.C = 0x0000;
        this.D = 0x0000;

        this.IP = 0x0000;
        this.SP = 0x0000;

        this.SR = { M: 0, C: 0, Z: 0, F: 0, H: 0 };
    }

    get(index) {
        return indexRegister[index];
    }

    getValue(register) {
        if(register.endsWith("H") || register.endsWith("L")) {
            const registerValue = this[register[0]];
            const isH = register.endsWith("H");

            return isH ? (registerValue >>> 8) & 0xFF : registerValue & 0xFF;
        }

        return this[register];
    }

    getIndex(register) {
        return registerIndex[register];
    }

    getValueByIndex(index) {
        const register = this.get(index);
        return this.getValue(register);
    }

    update(register, value) {
        if(register.endsWith("H") || register.endsWith("L")) {
            const [_, second] = ByteNumber.divide(value);

            const registerValue = this[register[0]];
            const isH = register.endsWith("H");

            if(isH) this[register[0]] = (second << 8) | (registerValue & 0xFF);
            else this[register[0]] = (registerValue & 0xFF00) | (second & 0xFF);
        }

        else if(register === "SR") this[register] = value;
        else this[register] = value & 0xFFFF; // We want to keep our register 16-bit.
    }

    reset() {
        this.A = 0x0000;
        this.B = 0x0000;
        this.C = 0x0000;
        this.D = 0x0000;

        this.IP = 0x0000;
        this.SP = 0x0000;

        this.SR = { M: 0, C: 0, Z: 0, F: 0, H: 0 };
    }
};