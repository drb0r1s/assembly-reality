import { AssemblerError } from "../AssemblerError";

export const Instants = {
    DW: instant => {
        const operand = instant.operands[0];
        const maxValue = 65535;

        if(operand.valueType === "number.decimal") {
            const intValue = parseInt(operand.value);
            
            if(intValue > maxValue) throw new AssemblerError("DecimalLimit16", {}, instant.line);
            return intValue.toString(16).toUpperCase().padStart(4, "0");
        }

        if(operand.valueType === "number.hex") {
            const intValue = parseInt(operand.value, 16);

            if(intValue > maxValue) throw new AssemblerError("HexLimit16", {}, instant.line);
            return operand.value.toUpperCase().padStart(4, "0");
        }
    },

    DB: instant => {
        const operand = instant.operands[0];
        const maxValue = 255;

        if(operand.valueType === "number.decimal") {
            const intValue = parseInt(operand.value);
            
            if(intValue > maxValue) throw new AssemblerError("DecimalLimit8", {}, instant.line);
            return intValue.toString(16).toUpperCase().padStart(2, "0");
        }

        if(operand.valueType === "number.hex") {
            const intValue = parseInt(operand.value, 16);

            if(intValue > maxValue) throw new AssemblerError("HexLimit8", {}, instant.line);
            return operand.value.toUpperCase().padStart(2, "0");
        }
    }
};