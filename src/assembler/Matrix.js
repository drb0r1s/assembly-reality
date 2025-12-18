import { ByteNumber } from "./ByteNumber";

export class Matrix {
    constructor(buffer, start = null, size = null) {
        this.values = start !== null ? new Uint8Array(buffer, start, size) : new Uint8Array(buffer);
    }

    getCell(row, column) {
        return this.values[row * 16 + column];
    }

    setCell(row, column, value) {
        this.values[row * 16 + column] = value;
    }

    get(address) {
        const [row, column] = this.getLocation(address);
        return this.getCell(row, column);
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

    update(address, value, options) {
        // 8-bit
        if(options?.isHalf) {
            const [row, column] = this.getLocation(address);
            this.setCell(row, column, value);
        }
    
        // 16-bit
        else {
            // It does not matter if 16-bit value is empty in the first two cells, .update() should still override it.
            const [firstCell, secondCell] = ByteNumber.divide(value);
    
            // This constant is used to shape the full 16-bit address.
            // Stack is writing addresses in memory from right to the left, while normal writing is from left to the right.
            const adjustments = options?.isStack ? [-1, 0] : [0, 1];
    
            const [firstRow, firstColumn] = this.getLocation(address + adjustments[0]);
            this.setCell(firstRow, firstColumn, firstCell);
    
            const [secondRow, secondColumn] = this.getLocation(address + adjustments[1]);
            this.setCell(secondRow, secondColumn, secondCell);
        }
    
        // Addresses reserved for mini display.
        if(address >= 4096 && address <= 4128) self.postMessage({ action: "miniDisplayUpdate" });
    }

    point(address, options) {
        if(options?.isHalf) return ByteNumber.join([0, this.get(address)]);
        
        // This constant is used to adjust the direction of pointing in memory.
        // In stack, we are pointing from right to left, instead of pointing from left to right.
        const adjustments = options?.isStack ? [-1, 0] : [0, 1];
        return ByteNumber.join([this.get(address + adjustments[0]), this.get(address + adjustments[1])]);
    }

    arrayify(options) {
        if(options?.miniDisplay) return Array.from(this.values.slice(-32));
        return Array.from(this.values);
    }

    reset() {
        this.values.fill(0);
    }
}