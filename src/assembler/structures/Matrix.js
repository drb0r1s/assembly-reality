import { ByteNumber } from "../helpers/ByteNumber";

export class Matrix {
    constructor(buffer, rowSize) {
        this.values = new Uint8Array(buffer);
        this.rowSize = rowSize; // 16 for RAM, 256 for Graphics.
    }

    getMatrix() {
        return this.values;
    }

    get(address) {
        return this.values[address];
    }

    set(address, value) {
        this.values[address] = value;
    }

    update(address, value, isHalf, isStack) {
        const values = this.values;
        
        // 8-bit
        if(isHalf) values[address] = value;
    
        // 16-bit
        else {
            const firstCell = value >>> 8;
            const secondCell = value & 0xFF;

            if(isStack) {
                values[address - 1] = firstCell;
                values[address] = secondCell;
            }

            else {
                values[address] = firstCell;
                values[address + 1] = secondCell;
            }
        }
    }

    point(address, isHalf, isStack) {
        const values = this.values;

        if(isHalf) return ByteNumber.join([0, values[address]]);

        if(isStack) return ByteNumber.join([values[address - 1], values[address]]);
        return ByteNumber.join([values[address], values[address + 1]]);
    }

    reset(start = 0, end = this.values.length - 1) {
        this.values.fill(0, start, end + 1);
    }
}