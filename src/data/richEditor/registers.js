// DEFAULT REGISTERS
const defaultRegisters = ["A", "B", "C", "D"];
const systemRegisters = ["SP"];

export const rootDefaultRegistersExpression = [...defaultRegisters, ...systemRegisters].join("|");

export const defaultRegistersRegex = new RegExp(`\\s(${rootDefaultRegistersExpression})(?=\\s|,|$)`);
export const memoryDefaultRegistersRegex = new RegExp(`\\s\\[(${rootDefaultRegistersExpression})\\](?=\\s|,|$)`);

// HALF REGISTERS
const halfRegisters = [];

for(let i = 0; i < defaultRegisters.length; i++) {
    halfRegisters.push(`${defaultRegisters[i]}L`, `${defaultRegisters[i]}H`);
}

export const rootHalfRegistersExpression = halfRegisters.join("|");

export const halfRegistersRegex = new RegExp(`\\s(${rootHalfRegistersExpression})(?=\\s|,|$)`);
export const memoryHalfRegistersRegex = new RegExp(`\\s\\[(${rootHalfRegistersExpression})\\](?=\\s|,|$)`);