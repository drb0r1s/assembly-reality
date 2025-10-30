const registerIndex = {
    A: "00",
    B: "01",
    C: "02",
    D: "03",
    SP: "04",
    IP: "05",
    SR: "06",
    AH: "07",
    AL: "08",
    BH: "09",
    BL: "0A",
    CH: "0B",
    CL: "0C",
    DH: "0D",
    DL: "0E"
};

const indexRegister = {
    "00": "A",
    "01": "B",
    "02": "C",
    "03": "D",
    "04": "SP",
    "05": "IP",
    "06": "SR",
    "07": "AH",
    "08": "AL",
    "09": "BH",
    "0A": "BL",
    "0B": "CH",
    "0C": "CL",
    "0D": "DH",
    "0E": "DL"
};

export class Registers {
    constructor() {
        this.A = "0000";
        this.B = "0000";
        this.C = "0000";
        this.D = "0000";

        this.IP = "0000";
        this.SP = "0000";

        this.SR = { M: "0", C: "0", Z: "0", F: "0", H: "0" };
    }

    get(index) {
        return indexRegister[index];
    }

    getValue(register) {
        if(register.includes("H") || register.includes("L")) {
            const isH = register.includes("H");

            register = register[0];
            const registerValue = this.getValue(register);

            const cell = isH ? registerValue.slice(0, 2) : registerValue.slice(-2);

            // Even though we expect 8-bit value, it is important to still return 16-bit value, with second cell empty.
            // This way we can "synchronize" this operation with others (e.g. memory.number.* type will call memory.point() which will result in 16-bit return value).
            return `${cell}00`;
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
        if(register.includes("H") || register.includes("L")) {
            const isH = register.includes("H");
            
            register = register[0];

            const updatedCell = value.slice(0, 2);
            const oldCell = isH ? this.getValue(register).slice(-2) : this.getValue(register).slice(0, 2);

            value = isH ? `${updatedCell}${oldCell}` : `${oldCell}${updatedCell}`;
        }

        this[register] = value;
    }

    copy(registers) {
        this.A = registers.A;
        this.B = registers.B;
        this.C = registers.C;
        this.D = registers.D;

        this.IP = registers.IP;
        this.SP = registers.SP;
        
        this.SR = registers.SR;
    }

    reset() {
        this.A = "0000";
        this.B = "0000";
        this.C = "0000";
        this.D = "0000";

        this.IP = "0000";
        this.SP = "0000";

        this.SR = { M: "0", C: "0", Z: "0", F: "0", H: "0" };
    }
};