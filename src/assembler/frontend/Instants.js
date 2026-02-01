import { AssemblerError } from "../AssemblerError";
import { ByteNumber } from "../helpers/ByteNumber";

export class Instants {
    constructor(ram) {
        this.ram = ram;

        this.DW = this.DW.bind(this);
        this.DB = this.DB.bind(this);
        this.ORG = this.ORG.bind(this);
    }

    DW(instant) {
        const operand = instant.operands[0];
        const maxValue = 65535;

        let result = null;

        if(operand.valueType === "number.decimal") {
            const intValue = parseInt(operand.value);
            if(intValue > maxValue) throw new AssemblerError("DecimalLimit16", {}, instant.line);
            
            result = ByteNumber.divide(intValue);
        }

        else if(operand.valueType === "number.binary") {
            const intValue = parseInt(operand.value, 2);
            if(intValue > maxValue) throw new AssemblerError("BinaryLimit16", {}, instant.line);
            
            result = ByteNumber.divide(intValue);
        }

        else if(operand.valueType === "number.hex") {
            const intValue = parseInt(operand.value, 16);
            if(intValue > maxValue) throw new AssemblerError("HexLimit16", {}, instant.line);
            
            result = ByteNumber.divide(intValue);
        }

        else if(operand.valueType === "string.double") {
            const characters = operand.value.split("");

            result = [];
            // Since we know that string characters are always less than 0xFF, we can simply add one additional 8-bit value of 0, to fill out 2 8-bit cells, which is required for this instant.
            characters.map(character => { result.push(0, character.charCodeAt(0)) });
        }

        else throw new AssemblerError("InvalidOperandInInstant",  { operand: operand.value, instant: instant.name });

        this.ram.write(result);
    }

    DB(instant) {
        const operand = instant.operands[0];
        const maxValue = 255;

        let result = null;

        if(operand.valueType === "number.decimal") {
            const intValue = parseInt(operand.value);
            if(intValue > maxValue) throw new AssemblerError("DecimalLimit8", {}, instant.line);

            result = [intValue];
        }

        else if(operand.valueType === "number.binary") {
            const intValue = parseInt(operand.value, 2);
            if(intValue > maxValue) throw new AssemblerError("BinaryLimit8", {}, instant.line);
            
            result = ByteNumber.divide(intValue);
        }

        else if(operand.valueType === "number.hex") {
            const intValue = parseInt(operand.value, 16);
            if(intValue > maxValue) throw new AssemblerError("HexLimit8", {}, instant.line);
            
            result = [intValue];
        }

        // Here we introduce the possibility of using special character \ in order to signal that the next 8-bit value is going to be written in the memory exactly as it is written in a string (not as an ASCII value), this is known as Exact Mode.
        // DB "\xAB" => "AB" is written in the memory.
        // DB "AB" => ASCII(A), ASCII(B) is written in the memory.
        // IMPORTANT: This functionality is DB-exclusive, DW doesn't support this.
        else if(operand.valueType === "string.double") {
            const characters = operand.value.split("");
            
            let exactMode = false;
            let exactModeValue = "";

            result = [];

            for(let i = 0; i < characters.length; i++) {
                const character = characters[i];

                if(character === "\\") {
                    // Edge case: DB "\xA\x03...", "\xA" is written as "0A" in memory.
                    if(exactModeValue.length > 0) {
                        result.push(parseInt(exactModeValue, 16));
                        exactModeValue = "";
                    }

                    exactMode = true;
                    continue;
                }

                if(["x", "X"].indexOf(character) > -1 && exactMode) continue;

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
        const maxValue = 0x101F;

        let result = null;

        if(operand.valueType === "number.decimal") {
            const intValue = parseInt(operand.value);
            if(intValue > maxValue) throw new AssemblerError("DecimalMemoryLimit", {}, instant.line);

            result = intValue;
        }

        else if(operand.valueType === "number.binary") {
            const intValue = parseInt(operand.value, 2);
            if(intValue > maxValue) throw new AssemblerError("BinaryMemoryLimit", {}, instant.line);

            result = intValue;
        }

        else if(operand.valueType === "number.hex") {
            const intValue = parseInt(operand.value, 16);
            if(intValue > maxValue) throw new AssemblerError("HexMemoryLimit", {}, instant.line);
        
            result = intValue;
        }

        else throw new AssemblerError("InvalidOperandInInstant",  { operand: operand.value, instant: instant.name });

        this.ram.adjustFree(result);
    }
}