import { AssemblerError } from "../AssemblerError";
import { Matrix } from "../structures/Matrix";

export class RAM {
    constructor(ramBuffer) {
        this.matrix = new Matrix(ramBuffer, 16),
        this.free = { i: 0, j: 0 } // Pointers to the last free-memory coordinates.
        this.instructions = []; // An array of instruction addresses in memory.
        this.stackStart = 0; // The address of the start of the stack.
    }

    write(cells) {
        let { i, j } = this.free;

        const rows = 258;
        const columns = 16;

        for(let k = 0; k < cells.length; k++) {
            const row = Math.floor((j + k) / columns) + i;
            const column = (j + k) % columns;

            if(row >= rows) throw new AssemblerError("OutOfMemory");

            this.matrix.setCell(row, column, cells[k]);
        }

        const finalPosition = j + cells.length;

        i += Math.floor(finalPosition / columns);
        j = finalPosition % columns;

        if(i > rows) throw new AssemblerError("OutOfMemory");

        this.free = { i, j };
    }


    advance(amount) {
        let { i, j } = this.free;

        j += amount;

        i += Math.floor(j / 16);
        j = j % 16;

        if(i >= this.matrix.getMatrix().length / 16) throw new AssemblerError("OutOfMemory");

        this.free = { i, j };
    }

    adjustFree(address) {
        const [row, column] = this.matrix.getLocation(address);

        this.free.i = row;
        this.free.j = column;
    }

    addInstruction() {
        this.instructions.push(this.matrix.getAddress(this.free.i, this.free.j));
    }

    reset() {
        this.matrix.reset();
        this.free = { i: 0, j: 0 };
        this.instructions = [];
        this.stackStart = 0;
    }
};