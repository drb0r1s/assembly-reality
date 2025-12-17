import { AssemblerError } from "./AssemblerError";
import { Matrix } from "./Matrix";
import { ByteNumber } from "./ByteNumber";

const memoryAddresses = { start: 0x0000, end: 0x101F };

export class Memory {
    constructor(memoryBuffer) {
        this.matrix = new Matrix(memoryBuffer, memoryAddresses.start, memoryAddresses.end - memoryAddresses.start + 1),
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

            if(i >= this.matrix.values.length / 16) throw new AssemblerError("OutOfMemory");
        }

        this.free = { i, j }; // Updating last memory-free coordinates globally.
    }

    rewrite(address, value, options) {
        // 8-bit
        if(options?.isHalf) {
            const [row, column] = this.matrix.getLocation(address);
            this.matrix.setCell(row, column, value);
        }

        // 16-bit
        else {
            // It does not matter if 16-bit value is empty in the first two cells, .rewrite() should still override it.
            const [firstCell, secondCell] = ByteNumber.divide(value);

            // This constant is used to shape the full 16-bit address.
            // Stack is writing addresses in memory from right to the left, while normal writing is from left to the right.
            const adjustments = options?.isStack ? [-1, 0] : [0, 1];

            const [firstRow, firstColumn] = this.matrix.getLocation(address + adjustments[0]);
            this.matrix.setCell(firstRow, firstColumn, firstCell);

            const [secondRow, secondColumn] = this.matrix.getLocation(address + adjustments[1]);
            this.matrix.setCell(secondRow, secondColumn, secondCell);
        }

        if(address >= 4096) self.postMessage({ action: "miniDisplayUpdate" });
    }

    advance(amount) {
        let { i, j } = this.free;

        j += amount;

        while(j > 15) {
            j -= 16;
            i++;
        }

        if(i >= this.matrix.values.length / 16) throw new AssemblerError("OutOfMemory");

        this.free = { i, j };
    }

    adjustFree(address) {
        const [row, column] = this.matrix.getLocation(address);

        this.free.i = row;
        this.free.j = column;
    }

    point(address, options) {
        if(options?.isHalf) return ByteNumber.join([0, this.matrix.get(address)]);
        
        // This constant is used to adjust the direction of pointing in memory.
        // In stack, we are pointing from right to left, instead of pointing from left to right.
        const adjustments = options?.isStack ? [-1, 0] : [0, 1];
        return ByteNumber.join([this.matrix.get(address + adjustments[0]), this.matrix.get(address + adjustments[1])]);
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