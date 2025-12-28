// DEFAULT REGISTERS
const registers = {
    default: ["A", "B", "C", "D"],
    system: ["SP"],
    half: []
};

const expressionDefaultRegistersRoot = [...registers.default, ...registers.system].join("|");
const expressionDefaultRegistersRegex = new RegExp(`\\s(${expressionDefaultRegistersRoot})(?=\\s|,|;|\\/\\/|$)`);
const expressionMemoryDefaultRegistersRegex = new RegExp(`\\[(${expressionDefaultRegistersRoot})\\](?=\\s|,|;|\\/\\/|$)`);

// HALF REGISTERS
for(let i = 0; i < registers.default.length; i++) {
    registers.half.push(`${registers.default[i]}L`, `${registers.default[i]}H`);
}

const expressionHalfRegistersRoot = registers.half.join("|");
const expressionHalfRegistersRegex = new RegExp(`\\s(${expressionHalfRegistersRoot})(?=\\s|,|;|\\/\\/|$)`);
const expressionMemoryHalfRegistersRegex = new RegExp(`\\s\\[(${expressionHalfRegistersRoot})\\](?=\\s|,|;|\\/\\/|$)`);

export const Registers = {
    list: registers,

    expression: {
        default: {
            root: expressionDefaultRegistersRoot,
            regex: expressionDefaultRegistersRegex,
            memory: expressionMemoryDefaultRegistersRegex
        },

        half: {
            root: expressionHalfRegistersRoot,
            regex: expressionHalfRegistersRegex,
            memory: expressionMemoryHalfRegistersRegex
        }
    }
};