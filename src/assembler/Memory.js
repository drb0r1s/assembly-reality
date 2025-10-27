import { AssemblerError } from "./Assembler";
import { Manager } from "../Manager";

export class Memory {
    constructor() {
        this.matrix = Array.from({ length: 258 }, () => Array.from({ length: 16 }, () => "00")),
        this.free = { i: 0, j: 0 } // Pointers to the last free-memory coordinates.
        this.execution = { i: 0, j: 0 } // Pointers to the last executed coordinates.
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

        Manager.trigger("memoryUpdate", this.matrix);
    }

    rewrite(address, value) {
        // If value is greater than 255, it should use two memory cells for representing a value that is greater than 8-bits.
        if(parseInt(value, 16) > 255) {
            const firstCell = value.slice(0, 2);

            const [row, column] = this.getLocation(address);
            this.matrix[row][column] = firstCell;
        }

        const secondCell = value.slice(-2);

        const [row, column] = this.getLocation((parseInt(address, 16) + 1).toString(16).toUpperCase());
        this.matrix[row][column] = secondCell;
    }

    get(address) {
        const [row, column] = this.getLocation(address);
        return this.matrix[row][column];
    }

    getLocation(address) {
        const index = parseInt(address, 16);

        const row = Math.floor(index / 16);
        const column = index % 16;

        return [row, column];
    }

    point(address) {
        const nextAddress = (parseInt(address, 16) + 1).toString().toUpperCase();
        return this.get(address) + this.get(nextAddress);
    }

    reset() {
        this.matrix = Array.from({ length: 258 }, () => Array.from({ length: 16 }, () => "00"));
        this.free = { i: 0, j: 0 };
        this.execution = { i: 0, j: 0 };
    }
};