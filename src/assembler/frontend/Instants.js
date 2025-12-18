import { AssemblerError } from "../AssemblerError";
import { ByteNumber } from "../ByteNumber";

export const Instants = {
    DW: (assembler, instant) => {
        const operand = instant.operands[0];
        const maxValue = 65535;

        let result = null;

        if(operand.valueType === "number.decimal") {
            const intValue = parseInt(operand.value);
            if(intValue > maxValue) throw new AssemblerError("DecimalLimit16", {}, instant.line);
            
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

        assembler.ram.write(result);
    },

    DB: (assembler, instant) => {
        const operand = instant.operands[0];
        const maxValue = 255;

        let result = null;

        if(operand.valueType === "number.decimal") {
            const intValue = parseInt(operand.value);
            if(intValue > maxValue) throw new AssemblerError("DecimalLimit8", {}, instant.line);

            result = [intValue];
        }

        else if(operand.valueType === "number.hex") {
            const intValue = parseInt(operand.value, 16);
            if(intValue > maxValue) throw new AssemblerError("HexLimit8", {}, instant.line);
            
            result = [intValue];
        }

        else if(operand.valueType === "string.double") {
            const characters = operand.value.split("");
            result = characters.map(character => character.charCodeAt(0));
        }

        else throw new AssemblerError("InvalidOperandInInstant",  { operand: operand.value, instant: instant.name });

        assembler.ram.write(result);
    },

    ORG: (assembler, instant) => {
        const operand = instant.operands[0];
        const maxValue = 0x101F;

        let result = null;

        if(operand.valueType === "number.decimal") {
            const intValue = parseInt(operand.value);
            if(intValue > maxValue) throw new AssemblerError("DecimalMemoryLimit", {}, instant.line);

            result = intValue;
        }

        else if(operand.valueType === "number.hex") {
            const intValue = parseInt(operand.value, 16);
            if(intValue > maxValue) throw new AssemblerError("HexMemoryLimit", {}, instant.line);
        
            result = intValue;
        }

        else throw new AssemblerError("InvalidOperandInInstant",  { operand: operand.value, instant: instant.name });

        assembler.ram.adjustFree(result);
    }
};