import { AssemblerError } from "./AssemblerError";

export class Memory {
    constructor() {
        this.matrix = Array.from({ length: 258 }, () => Array.from({ length: 16 }, () => "00")),
        this.free = { i: 0, j: 0 } // Pointers to the last free-memory coordinates.
        this.execution = { i: 0, j: 0 } // Pointers to the last executed coordinates.
        this.blocks = []; // Blocks of instructions (code) or instants (data). Structure of the block is [type, length].
        this.blockPointer = 0; // Index of the last visited block.
    }

    // type: code || data
    write(hex, type) {
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
        this.blocks.push([type, hexCells.length]);
    }

    rewrite(address, value) {
        // 16-bit
        if(value.length === 4) {
            // It does not matter if 16-bit value is empty in the first two cells, .rewrite() should still override it.
            const firstCell = value.slice(0, 2);

            const [firstRow, firstColumn] = this.getLocation(address);
            this.matrix[firstRow][firstColumn] = firstCell;

            const secondCell = value.slice(-2);

            const [secondRow, secondColumn] = this.getLocation((parseInt(address, 16) + 1).toString(16).toUpperCase());
            this.matrix[secondRow][secondColumn] = secondCell;
        }

        // 8-bit
        else {
            const [row, column] = this.getLocation(address);
            this.matrix[row][column] = value;
        }
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

    getAddress(row, column) {
        const index = row * 16 + column;
        return index.toString(16).toUpperCase().padStart(4, "0");
    }

    getBlock() {
        return this.blocks[this.blockPointer];
    }

    nextBlock() {
        this.blockPointer++;
    }

    advance(amount, options) {
        const pointers = options?.execution ? this.execution : this.free;
        let { i, j } = pointers;

        j += amount;

        while (j > 15) {
            j -= 16;
            i++;
        }

        if(i >= this.matrix.length) throw new AssemblerError("OutOfMemory");

        if(options?.execution) this.execution = { i, j };
        else this.free = { i, j };
    }

    point(address) {
        const nextAddress = (parseInt(address, 16) + 1).toString(16).toUpperCase();
        return this.get(address) + this.get(nextAddress);
    }

    adjustExecution(address) {
        const [row, column] = this.getLocation(address);

        this.execution.i = row;
        this.execution.j = column;
    }

    copy(memory) {
        this.matrix = memory.matrix;
        this.free = memory.free;
        this.execution = memory.execution;
    }

    reset() {
        this.matrix = Array.from({ length: 258 }, () => Array.from({ length: 16 }, () => "00"));
        this.free = { i: 0, j: 0 };
        this.execution = { i: 0, j: 0 };
        this.blocks = [];
        this.blockPointer = 0;
    }
};