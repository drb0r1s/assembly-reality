const defaultRegisters = ["A", "B", "C", "D"];
const registers = [];

for(let i = 0; i < defaultRegisters.length; i++) {
    registers.push(defaultRegisters[i], `${defaultRegisters[i]}L`, `${defaultRegisters[i]}H`);
}

// .sort() is needed here to fix the common issue of matching "registerL" or "registerH" without considering "L" or "H".
export const rootRegistersExpression = [...registers].sort((a, b) => b.length - a.length).join("|");

export const registersRegex = new RegExp(`\\s(${rootRegistersExpression})(?=\\s|,|$)`);
export const memoryRegistersRegex = new RegExp(`\\s\\[(${rootRegistersExpression})\\](?=\\s|,|$)`);