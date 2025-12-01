import { AssemblerError } from "./AssemblerError";

export class Labels {
    constructor() {
        this.collection = {};
    }

    collect(label, memory) {
        if(this.collection[label.name]) throw new AssemblerError("DuplicatedLabel", { label: label.name }, label.line);

        const row = memory.free.i;
        const column = memory.free.j;

        this.collection = {
            ...this.collection,
            [label.name]: memory.getAddress(row, column).toString(16)
        };
    }

    // Every label node (types: label.reference, memory.label.reference) should be renamed to number.* and memory.number.*.
    transform(ast) {
        const targetTypes = ["label.reference", "memory.label.reference"];
        
        for(const statement of ast.statements) {
            if(["Instruction", "Instant"].indexOf(statement.type) === -1) continue;

            for(const operand of statement.operands) {
                if(targetTypes.indexOf(operand.valueType) > -1) {
                    const address = this.collection[operand.value];
                    if(address === undefined) throw new AssemblerError("UnknownLabel", { label: operand.value }, statement.line);

                    operand.value = address;
                    
                    const isMemory = operand.valueType.startsWith("memory");
                    operand.valueType = isMemory ? "memory.number.hex" : "number.hex";
                }
            }
        }

        return ast;
    }

    reset() {
        this.collection = {};
    }
};