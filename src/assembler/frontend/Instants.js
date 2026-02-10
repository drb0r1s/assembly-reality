import { AssemblerError } from "../AssemblerError";
import { ByteNumber } from "../helpers/ByteNumber";

const bases = {
    binary: 2,
    octal: 8,
    decimal: 10,
    hex: 16
};

const baseNames = {
    binary: "Binary",
    octal: "Octal",
    decimal: "Decimal",
    hex: "Hex"
};

const maxValues = {
    DW: 65535,
    DB: 255,
    ORG: 0x101F
};

const limitSuffixes = {
    DW: "Limit16",
    DB: "Limit8",
    ORG: "MemoryLimit"
};

export class Instants {
    constructor(ram) {
        this.ram = ram;

        this.DW = this.DW.bind(this);
        this.DB = this.DB.bind(this);
        this.ORG = this.ORG.bind(this);
    }

    DW(instant) {
        const operand = instant.operands[0];

        let result = null;

        // number.decimal, number.binary, number.octal, number.hex
        if(operand.valueType[0] === "n") result = processNumber(instant, operand);

        else if(operand.valueType === "string.double") {
            result = [];
            // Since we know that string characters are always less than 0xFF, we can simply add one additional 8-bit value of 0, to fill out 2 8-bit cells, which is required for this instant.
            for(let i = 0; i < operand.value.length; i++) result.push(0, operand.value.charCodeAt(i));
        }

        else throw new AssemblerError("InvalidOperandInInstant",  { operand: operand.value, instant: instant.name });

        this.ram.write(result);
    }

    DB(instant) {
        const operand = instant.operands[0];

        let result = null;

        // number.decimal, number.binary, number.octal, number.hex
        if(operand.valueType[0] === "n") result = processNumber(instant, operand);

        // Here we introduce the possibility of using special character \ in order to signal that the next 8-bit value is going to be written in the memory exactly as it is written in a string (not as an ASCII value), this is known as Exact Mode.
        // DB "\xAB" => "AB" is written in the memory.
        // DB "AB" => ASCII(A), ASCII(B) is written in the memory.
        // IMPORTANT: This functionality is DB-exclusive, DW doesn't support this.
        else if(operand.valueType === "string.double") {            
            let exactMode = false;
            let exactModeValue = "";

            result = [];

            for(let i = 0; i < operand.value.length; i++) {
                const character = operand.value[i];

                if(character === "\\") {
                    // Edge case: DB "\xA\x03...", "\xA" is written as "0A" in memory.
                    if(exactModeValue.length > 0) {
                        result.push(parseInt(exactModeValue, 16));
                        exactModeValue = "";
                    }

                    exactMode = true;
                    continue;
                }

                if((character === "x" || character === "X") && exactMode) continue;

                if(exactMode) {
                    exactModeValue += character;

                    if(exactModeValue.length === 2) {
                        exactMode = false;

                        result.push(parseInt(exactModeValue, 16));
                        exactModeValue = "";
                    }
                }
                
                else result.push(character.charCodeAt(0));
            }
        }

        else throw new AssemblerError("InvalidOperandInInstant",  { operand: operand.value, instant: instant.name });

        this.ram.write(result);
    }

    ORG(instant) {
        const operand = instant.operands[0];

        let result = null;

        if(operand.valueType.startsWith("number.")) result = processNumber(instant, operand);

        else throw new AssemblerError("InvalidOperandInInstant",  { operand: operand.value, instant: instant.name });

        this.ram.adjustFree(result);
    }
}

function processNumber(instant, operand) {
    const maxValue = maxValues[instant.name];

    const type = operand.valueType.slice(7);

    const base = bases[type];
    const baseName = baseNames[type];
    const limitSuffix = limitSuffixes[instant.name];

    const intValue = parseInt(operand.value, base);
    if(intValue > maxValue) throw new AssemblerError(`${baseName}${limitSuffix}`, {}, instant.line);
    
    switch(instant.name) {
        case "DW": return ByteNumber.divide(intValue);
        case "DB": return [intValue];
        case "ORG": return intValue;
    }
}