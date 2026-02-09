import { ByteNumber } from "../helpers/ByteNumber";
import { AssemblerError } from "../AssemblerError";

const allRegisters = [
    "A", "B", "C", "D",
    "SP", "IP", "SR",
    "AH", "AL", "BH", "BL", "CH", "CL", "DH", "DL"
];

export class CPURegisters {
    constructor(cpuRegistersBuffer) {
        this.registers = new Uint16Array(cpuRegistersBuffer);
        this.registerIndexes = {};
        this.collection = {};

        allRegisters.forEach((register, index) => { this.registerIndexes[register] = index });
    }

    construct() {
        let constructed = {};

        // Here we want to visit only the first 7 elements of allRegisters, these are the real registers, all others are just half registers.
        for(let i = 0; i < 7; i++) {
            const register = allRegisters[i];

            if(register === "SR") constructed[register] = this.constructSR();
            else constructed[register] = this.getValueByIndex(i);
        }

        return constructed;
    }

    constructSR() {
        const SR = this.getValue("SR");

        return {
            M: (SR >> 4) & 1,
            C: (SR >> 3) & 1,
            Z: (SR >> 2) & 1,
            F: (SR >> 1) & 1,
            H: (SR >> 0) & 1,
        };
    }

    get(index) {
        return allRegisters[index];
    }

    getIndex(register) {
        return this.registerIndexes[register];
    }

    getValue(register) {
        // 8-bit
        if(register.endsWith("H") || register.endsWith("L")) {
            const fullRegister = register[0];
            const fullRegisterValue = Atomics.load(this.registers, this.getIndex(fullRegister));

            if(register.endsWith("H")) return (fullRegisterValue >>> 8) & 0xFF;
            return fullRegisterValue & 0xFF;
        }

        // 16-bit
        return Atomics.load(this.registers, this.getIndex(register));
    }

    getValueByIndex(index) {
        const register = this.get(index);
        return this.getValue(register);
    }

    getSRFlag(flag) {
        const SR = this.getValue("SR");

        switch(flag) {
            case "M": return (SR >> 4) & 1;
            case "C": return (SR >> 3) & 1;
            case "Z": return (SR >> 2) & 1;
            case "F": return (SR >> 1) & 1;
            case "H": return SR & 1;
        }
    }

    update(register, value) {
        if(register === "SP" && value > 0x101F) throw new AssemblerError("StackPointerLimit");

        // 8-bit
        if(register.endsWith("H") || register.endsWith("L")) {
            const fullRegister = register[0];
            const fullRegisterValue = Atomics.load(this.registers, this.getIndex(fullRegister));
        
            const [_, second] = ByteNumber.divide(value);

            if(register.endsWith("H")) {
                const newValue = (second << 8) | (fullRegisterValue & 0xFF);
                Atomics.store(this.registers, this.getIndex(fullRegister), newValue);
            }

            else {
                const newValue = (fullRegisterValue & 0xFF00) | (second & 0xFF);
                Atomics.store(this.registers, this.getIndex(fullRegister), newValue);
            }
        }

        // 16-bit
        else Atomics.store(this.registers, this.getIndex(register), value);
    }

    updateSR(newSR) {
        const SR = this.constructSR();

        const updatedSR = {
            M: newSR?.M !== undefined ? newSR.M : SR.M,
            C: newSR?.C !== undefined ? newSR.C : SR.C,
            Z: newSR?.Z !== undefined ? newSR.Z : SR.Z,
            F: newSR?.F !== undefined ? newSR.F : SR.F,
            H: newSR?.H !== undefined ? newSR.H : SR.H,
        };

        const newSRBinary = (updatedSR.M << 4) | (updatedSR.C << 3) | (updatedSR.Z << 2) | (updatedSR.F << 1) | (updatedSR.H << 0);
        Atomics.store(this.registers, this.getIndex("SR"), newSRBinary);
    }

    collect(operands, ram, lengthOfInstruction) {
        // For performance purposes, we'll use the rule that there are either 1 or 3 operands.
        if(operands.length === 1) {
            if(isRegister(operands[0])) this.collection[ram.free + 1] = operands[0].value;
        }

        else if(operands.length === 3) {
            const first = operands[0];
            if(isRegister(first)) this.collection[ram.free + 1] = first.value;

            const second = operands[2];
            if(isRegister(second)) this.collection[ram.free + lengthOfInstruction - 1] = second.value;
        }
    }

    reset() {
        for(let i = 0; i < this.registers.length; i++) {
            Atomics.store(this.registers, i, 0);
        }

        this.collection = {};
    }
};

function isRegister(operand) {
    const targetRegisters = ["A", "B", "C", "D"];

    if(
        operand.valueType === "register" &&
        targetRegisters.indexOf(operand.value) > -1
    ) return true;

    return false;
}