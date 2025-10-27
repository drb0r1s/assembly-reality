import { AssemblerError } from "./Assembler";

export class Memory {
    constructor() {
        this.matrix = Array.from({ length: 258 }, () => Array.from({ length: 16 }, () => "00")),
        this.free = { i: 0, j: 0 } // Pointers to the last free-memory coordinates.
        this.execution = { i: 0, j: 0 } // Pointers to the last executed coordinates.
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

    rewrite(address) {
        
    }

    reset() {
        this.matrix = Array.from({ length: 258 }, () => Array.from({ length: 16 }, () => "00"));
        this.free = { i: 0, j: 0 } // Pointers to the last free-memory coordinates.
    }

    get(address) {
        const index = parseInt(address, 16);

        const row = Math.floor(index / 16);
        const column = index % 16;

        return this.matrix[row][column];
    }

    point(address) {
        const nextAddress = (parseInt(address, 16) + 1).toString().toUpperCase();
        return this.get(address) + this.get(nextAddress);
    }
};