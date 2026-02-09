import { AssemblerError } from "../AssemblerError";

export class Labels {
    constructor() {
        this.collection = {};
    }

    collect(label, ram) {
        if(this.collection[label.name]) throw new AssemblerError("DuplicatedLabel", { label: label.name }, label.line);
        this.collection[label.name] = ram.free.toString(16);
    }

    // Every label node (types: label.reference, memory.label.reference) should be renamed to number.* and memory.number.*.
    transform(ast) {
        const targetTypes = ["label.reference", "memory.label.reference"];
        
        for(const statement of ast.statements) {
            if(statement.type !== "Instruction" && statement.type !== "Instant") continue;

            for(const operand of statement.operands) {
                if(operand.valueType === "label.reference" || operand.valueType === "memory.label.reference") {
                    const address = this.collection[operand.value];
                    if(address === undefined) throw new AssemblerError("UnknownLabel", { label: operand.value }, statement.line);

                    operand.value = address;
                    
                    const isMemory = operand.valueType[0] === "m";
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