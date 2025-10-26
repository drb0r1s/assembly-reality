import { AssemblerError } from "./Assembler";

export class Memory {
    constructor() {
        this.matrix = Array.from({ length: 258 }, () => Array.from({ length: 16 }, () => "00")),
        this.free = { i: 0, j: 0 } // Pointers to the last free-memory coordinates.
        this.onChange = null;
    }

    write(hex) {
        let { i, j } = this.free;
        const hexCells = hex.match(/.{1,2}/g); // Breaking hex string into groups of two digit numbers, to fit memory cells.

        for(let k = 0; k < hexCells.length; k++) {
            this.matrix[i][j] = hexCells[k];

            if(j === 15) {
                i++;
                j = 0;
            }

            else j++;

            if(i > this.matrix.length) throw new AssemblerError("OutOfMemory");
        }

        this.free = { i, j }; // Updating last memory-free coordinates globally.

        if(this.onChange) this.onChange(this.matrix);
    }

    reset() {
        this.matrix = Array.from({ length: 258 }, () => Array.from({ length: 16 }, () => "00"));
        this.free = { i: 0, j: 0 } // Pointers to the last free-memory coordinates.
    }
};