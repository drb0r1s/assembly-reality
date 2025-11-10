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

        if(operand.valueType === "number.hex") {
            const intValue = parseInt(operand.value, 16);
            if(intValue > maxValue) throw new AssemblerError("HexLimit16", {}, instant.line);
            
            result = ByteNumber.divide(intValue);
        }

        assembler.memory.write(result);
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

        if(operand.valueType === "number.hex") {
            const intValue = parseInt(operand.value, 16);
            if(intValue > maxValue) throw new AssemblerError("HexLimit8", {}, instant.line);
            
            result = [intValue];
        }

        assembler.memory.write(result);
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

        if(operand.valueType === "number.hex") {
            const intValue = parseInt(operand.value, 16);
            if(intValue > maxValue) throw new AssemblerError("HexMemoryLimit", {}, instant.line);
        
            result = intValue;
        }

        assembler.memory.adjustFree(result);
    }
};