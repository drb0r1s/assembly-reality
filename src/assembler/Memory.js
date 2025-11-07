import { AssemblerError } from "./AssemblerError";
import { ByteNumber } from "./ByteNumber";

export class Memory {
    constructor() {
        this.matrix = new Uint8Array(258 * 16),
        this.free = { i: 0, j: 0 } // Pointers to the last free-memory coordinates.
        this.instructions = []; // An array with instruction addresses in memory.
        this.instructionIndex = 0; // Index of the current instruction.
    }

    getMatrixCell(row, column) {
        return this.matrix[row * 16 + column];
    }

    setMatrixCell(row, column, value) {
        this.matrix[row * 16 + column] = value;
    }

    write(cells) {
        let { i, j } = this.free;

        for(let k = 0; k < cells.length; k++) {
            this.setMatrixCell(i, j, cells[k]);

            if(j === 15) {
                i++;
                j = 0;
            }

            else j++;

            if(i >= this.matrix.length / 16) throw new AssemblerError("OutOfMemory");
        }

        this.free = { i, j }; // Updating last memory-free coordinates globally.
    }

    rewrite(address, value, options) {
        // 8-bit
        if(options?.isHalf) {
            const [row, column] = this.getLocation(address);
            this.setMatrixCell(row, column, value);
        }

        // 16-bit
        else {
            // It does not matter if 16-bit value is empty in the first two cells, .rewrite() should still override it.
            const [firstCell, secondCell] = ByteNumber.divide(value);

            const [firstRow, firstColumn] = this.getLocation(address);
            this.setMatrixCell(firstRow, firstColumn, firstCell);

            const [secondRow, secondColumn] = this.getLocation(address + 1);
            this.setMatrixCell(secondRow, secondColumn, secondCell);
        }
    }

    get(address) {
        const [row, column] = this.getLocation(address);
        return this.getMatrixCell(row, column);
    }

    getLocation(address) {
        const row = Math.floor(address / 16);
        const column = address % 16;

        return [row, column];
    }

    getAddress(row, column) {
        const location = row * 16 + column;
        return location;
    }

    advance(amount) {
        let { i, j } = this.free;

        j += amount;

        while(j > 15) {
            j -= 16;
            i++;
        }

        if(i >= this.matrix.length / 16) throw new AssemblerError("OutOfMemory");

        this.free = { i, j };
    }

    point(address, options) {
        if(options?.isHalf) return ByteNumber.join([0, this.get(address)]);
        return ByteNumber.join([this.get(address), this.get(address + 1)]);
    }

    addInstruction() {
        this.instructions.push(this.getAddress(this.free.i, this.free.j));
    }

    nextInstruction() {
        this.instructionIndex++;
    }

    getCurrentInstruction() {
        return this.instructions[this.instructionIndex];
    }

    adjustInstructionIndex(address) {
        const index = this.instructions.indexOf(address);

        // IMPORTANT: We need to go one instruction back!
        // .adjustInstructionIndex happens only in "move" executables, meaning the instruction index will be adjusted inside assembler.executeInstruction method.
        // Because of that, right after executing jump, .nextInstruction method happens, moving instructionIndex to the next instruction, skipping the one we jumped on.
        // So, -1 is used for instruction-skipping prevention.
        this.instructionIndex = index - 1;
    }

    copy(memory) {
        this.matrix = memory.matrix;
        this.free = memory.free;
    }

    reset() {
        this.matrix = new Uint8Array(258 * 16);
        this.free = { i: 0, j: 0 };
        this.instructions = [];
        this.instructionIndex = 0;
    }
};