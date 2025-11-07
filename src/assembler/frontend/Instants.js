import { AssemblerError } from "../AssemblerError";
import { ByteNumber } from "../ByteNumber";

export const Instants = {
    DW: instant => {
        const operand = instant.operands[0];
        const maxValue = 65535;

        if(operand.valueType === "number.decimal") {
            const intValue = parseInt(operand.value);
            if(intValue > maxValue) throw new AssemblerError("DecimalLimit16", {}, instant.line);
            
            return ByteNumber.divide(intValue);
        }

        if(operand.valueType === "number.hex") {
            const intValue = parseInt(operand.value, 16);
            if(intValue > maxValue) throw new AssemblerError("HexLimit16", {}, instant.line);
            
            return ByteNumber.divide(intValue);
        }
    },

    DB: instant => {
        const operand = instant.operands[0];
        const maxValue = 255;

        if(operand.valueType === "number.decimal") {
            const intValue = parseInt(operand.value);
            if(intValue > maxValue) throw new AssemblerError("DecimalLimit8", {}, instant.line);

            return [intValue];
        }

        if(operand.valueType === "number.hex") {
            const intValue = parseInt(operand.value, 16);
            if(intValue > maxValue) throw new AssemblerError("HexLimit8", {}, instant.line);
            
            return [intValue];
        }
    }
};