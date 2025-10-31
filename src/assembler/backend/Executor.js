import { Decoder } from "./Decoder";
import { HexCalculator } from "./HexCalculator";

export const Executor = {
    codes: {
        // MOV
        "01": { instruction: "MOV", type: "register register", length: 3 },
        "02": { instruction: "MOV", type: "register memory.register", length: 4 },
        "03": { instruction: "MOV", type: "register memory.number.*", length: 4 },
        "04": { instruction: "MOV", type: "memory.register register", length: 4 },
        "05": { instruction: "MOV", type: "memory.number.* register", length: 4 },
        "06": { instruction: "MOV", type: "register number.*", length: 4 },
        "07": { instruction: "MOV", type: "memory.register number.*", length: 5 },
        "08": { instruction: "MOV", type: "memory.number.* number.*", length: 5 },

        // MOVB
        "09": { instruction: "MOVB", type: "half.register half.register", length: 3 },
        "0A": { instruction: "MOVB", type: "half.register memory.register", length: 4 },
        "0B": { instruction: "MOVB", type: "half.register memory.number.*", length: 4 },
        "0C": { instruction: "MOVB", type: "memory.register half.register", length: 4 },
        "0D": { instruction: "MOVB", type: "memory.number.* half.register", length: 4 },
        "0E": { instruction: "MOVB", type: "half.register number.*", length: 3 },
        "0F": { instruction: "MOVB", type: "memory.register number.*", length: 4 },
        "10": { instruction: "MOVB", type: "memory.number.* number.*", length: 4 },
        
        // ADD
        "11": { instruction: "ADD", type: "register register", length: 3 },
        "12": { instruction: "ADD", type: "register memory.register", length: 4 },
        "13": { instruction: "ADD", type: "register memory.number.*", length: 4 },
        "14": { instruction: "ADD", type: "register number.*", length: 4 },

        // ADDB
        "15": { instruction: "ADDB", type: "half.register half.register", length: 3 },
        "16": { instruction: "ADDB", type: "half.register memory.register", length: 4 },
        "17": { instruction: "ADDB", type: "half.register memory.number.*", length: 4 },
        "18": { instruction: "ADDB", type: "half.register number.*", length: 3 },

        // SUB
        "19": { instruction: "SUB", type: "register register", length: 3 },
        "1A": { instruction: "SUB", type: "register memory.register", length: 4 },
        "1B": { instruction: "SUB", type: "register memory.number.*", length: 4 },
        "1C": { instruction: "SUB", type: "register number.*", length: 4 },

        // SUBB
        "1D": { instruction: "SUBB", type: "half.register half.register", length: 3 },
        "1E": { instruction: "SUBB", type: "half.register memory.register", length: 4 },
        "1F": { instruction: "SUBB", type: "half.register memory.number.*", length: 4 },
        "20": { instruction: "SUBB", type: "half.register number.*", length: 3 },

        // INC
        "21": { instruction: "INC", type: "register", length: 2 },

        // INCB
        "22": { instruction: "INCB", type: "half.register", length: 2 },

        // DEC
        "23": { instruction: "DEC", type: "register", length: 2 },

        // DECB
        "24": { instruction: "DECB", type: "half.register", length: 2 },

        // MUL
        "48": { instruction: "MUL", type: "register", length: 3 },
        "49": { instruction: "MUL", type: "memory.register", length: 3 },
        "4A": { instruction: "MUL", type: "memory.number.*", length: 3 },
        "4B": { instruction: "MUL", type: "number.*", length: 3 },
    },

    MOV: (assembler, executable, args) => {
        const { first, second } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "register register": () => assembler.registers.update(first.register, second.registerValue),
            "register memory.register": () => assembler.registers.update(first.register, second.memoryPoint),
            "register memory.number.*": () => assembler.registers.update(first.register, second.memoryPoint),
            "memory.register register": () => assembler.memory.rewrite(first.registerValue, second.registerValue),
            "memory.number.* register": () => assembler.memory.rewrite(first.value, second.registerValue),
            "register number.*": () => assembler.registers.update(first.register, second.value),
            "memory.register number.*": () => assembler.memory.rewrite(first.registerValue, second.value),
            "memory.number.* number.*": () => assembler.memory.rewrite(first.value, second.value)
        });
    },

    MOVB: (assembler, executable, args) => {
        const { first, second } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "half.register half.register": () => assembler.registers.update(first.register, second.registerValue),
            "half.register memory.register": () => assembler.registers.update(first.register, second.memoryPoint),
            "half.register memory.number.*": () => assembler.registers.update(first.register, second.memoryPoint),
            "memory.register half.register": () => assembler.memory.rewrite(first.registerValue, second.registerValue),
            "memory.number.* half.register": () => assembler.memory.rewrite(first.value, second.registerValue),
            "half.register number.*": () => assembler.registers.update(first.register, second.value),
            "memory.register number.*": () => assembler.memory.rewrite(first.registerValue, second.value),
            "memory.number.* number.*": () => assembler.memory.rewrite(first.value, second.value)
        });
    },

    ADD: (assembler, executable, args) => {
        const { first, second } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "register register": () => {
                const sum = HexCalculator.add(first.registerValue, second.registerValue);
                assembler.registers.update(first.register, sum);
            },

            "register memory.register": () => {
                const sum = HexCalculator.add(first.registerValue, second.memoryPoint);
                assembler.registers.update(first.register, sum);
            },

            "register memory.number.*": () => {
                const sum = HexCalculator.add(first.registerValue, second.memoryPoint);
                assembler.registers.update(first.register, sum);
            },

            "register number.*": () => {
                const sum = HexCalculator.add(first.registerValue, second.value);
                assembler.registers.update(first.register, sum);
            }
        });
    },

    ADDB: (assembler, executable, args) => {
        const { first, second } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "half.register half.register": () => {
                const sum = HexCalculator.add(first.registerValue, second.registerValue);
                assembler.registers.update(first.register, sum);
            },

            "half.register memory.register": () => {
                const sum = HexCalculator.add(first.registerValue, second.memoryPoint)
                assembler.registers.update(first.register, sum);
            },

            "half.register memory.number.*": () => {
                const sum = HexCalculator.add(first.registerValue, second.memoryPoint);
                assembler.registers.update(first.register, sum);
            },

            "half.register number.*": () => {
                const sum = HexCalculator.add(first.registerValue, second.value, { isHalf: true });
                assembler.registers.update(first.register, sum);
            }
        });
    },

    SUB: (assembler, executable, args) => {
        const { first, second } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "register register": () => {
                const diff = HexCalculator.sub(first.registerValue, second.registerValue);
                assembler.registers.update(first.register, diff);
            },

            "register memory.register": () => {
                const diff = HexCalculator.sub(first.registerValue, second.memoryPoint);
                assembler.registers.update(first.register, diff);
            },

            "register memory.number.*": () => {
                const diff = HexCalculator.sub(first.registerValue, second.memoryPoint);
                assembler.registers.update(first.register, diff);
            },

            "register number.*": () => {
                const diff = HexCalculator.sub(first.registerValue, second.value);
                assembler.registers.update(first.register, diff);
            }
        });
    },

    SUBB: (assembler, executable, args) => {
        const { first, second } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "half.register half.register": () => {
                const diff = HexCalculator.sub(first.registerValue, second.registerValue);
                assembler.registers.update(first.register, diff);
            },

            "half.register memory.register": () => {
                const diff = HexCalculator.sub(first.registerValue, second.memoryPoint)
                assembler.registers.update(first.register, diff);
            },

            "half.register memory.number.*": () => {
                const diff = HexCalculator.sub(first.registerValue, second.memoryPoint);
                assembler.registers.update(first.register, diff);
            },

            "half.register number.*": () => {
                const diff = HexCalculator.sub(first.registerValue, second.value, { isHalf: true });
                assembler.registers.update(first.register, diff);
            }
        });
    },

    INC: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "register": () => {
                const sum = HexCalculator.add(first.registerValue, "0001");
                assembler.registers.update(first.register, sum)
            }
        });
    },

    INCB: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "half.register": () => {
                const sum = HexCalculator.add(first.registerValue, "0001", { isHalf: true });
                assembler.registers.update(first.register, sum)
            }
        });
    },

    DEC: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "register": () => {
                const diff = HexCalculator.sub(first.registerValue, "0001");
                assembler.registers.update(first.register, diff)
            }
        });
    },

    DECB: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "half.register": () => {
                const diff = HexCalculator.sub(first.registerValue, "0001", { isHalf: true });
                assembler.registers.update(first.register, diff)
            }
        });
    },

    MUL: (assembler, executable, args) => {
        const { first } = Decoder.decode(assembler, executable, args);

        Decoder.run(executable, {
            "register": () => {
                
            }
        });
    }
};