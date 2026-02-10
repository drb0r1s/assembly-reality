import { AssemblerError } from "../AssemblerError";
import { Matrix } from "../structures/Matrix";

export class RAM {
    constructor(ramBuffer) {
        this.matrix = new Matrix(ramBuffer, 16),
        this.free = 0; // Pointer to the last free-memory address.
        this.instructions = new Set();
        this.stackStart = 0; // The address of the start of the stack.
    }

    write(cells) {
        const memory = this.matrix.getMatrix();

        const start = this.free;
        const end = start + cells.length;

        if(end > memory.length) throw new AssemblerError("OutOfMemory");

        for(let i = 0; i < cells.length; i++) memory[start + i] = cells[i];

        this.free = end;
    }

    advance(amount) {
        const memory = this.matrix.getMatrix();
        const end = this.free + amount;

        if(end > memory.length) throw new AssemblerError("OutOfMemory");

        this.free = end;
    }

    adjustFree(address) {
        const memory = this.matrix.getMatrix();
        if(address < 0 || address > memory.length) throw new AssemblerError("OutOfMemory");

        this.free = address;
    }

    addInstruction() {
        this.instructions.add(this.free);
    }

    reset() {
        this.matrix.reset();
        this.free = 0;
        this.instructions = new Set();
        this.stackStart = 0;
    }
};