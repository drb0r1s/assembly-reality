import { AssemblerError } from "./AssemblerError";
import { Matrix } from "./Matrix";

export class RAM {
    constructor(ramBuffer) {
        this.matrix = new Matrix(ramBuffer, 16),
        this.free = { i: 0, j: 0 } // Pointers to the last free-memory coordinates.
        this.instructions = []; // An array of instruction addresses in memory.
        this.stackStart = 0; // The address of the start of the stack.
    }

    write(cells) {
        let { i, j } = this.free;

        for(let k = 0; k < cells.length; k++) {
            this.matrix.setCell(i, j, cells[k]);

            if(j === 15) {
                i++;
                j = 0;
            }

            else j++;

            if(i >= this.matrix.getMatrix().length / 16) throw new AssemblerError("OutOfMemory");
        }

        this.free = { i, j }; // Updating last memory-free coordinates globally.
    }

    advance(amount) {
        let { i, j } = this.free;

        j += amount;

        while(j > 15) {
            j -= 16;
            i++;
        }

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