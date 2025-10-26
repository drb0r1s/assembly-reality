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

export const Registers = {
    getIndex: register => {
        return registerIndex[register];
    },

    getRegister: index => {
        return indexRegister[index];
    }
};