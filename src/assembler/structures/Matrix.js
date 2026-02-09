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
        // 8-bit
        if(isHalf) this.set(address, value);
    
        // 16-bit
        else {
            // It does not matter if 16-bit value is empty in the first two cells, .update() should still override it.
            const [firstCell, secondCell] = ByteNumber.divide(value);
    
            // This constant is used to shape the full 16-bit address.
            // Stack is writing addresses in memory from right to the left, while normal writing is from left to the right.
            const adjustments = isStack ? [-1, 0] : [0, 1];
    
            this.set(address + adjustments[0], firstCell);
            this.set(address + adjustments[1], secondCell);
        }
    }

    point(address, isHalf, isStack) {
        if(isHalf) return ByteNumber.join([0, this.get(address)]);
        
        // This constant is used to adjust the direction of pointing in memory.
        // In stack, we are pointing from right to left, instead of pointing from left to right.
        const adjustments = isStack ? [-1, 0] : [0, 1];
        return ByteNumber.join([this.get(address + adjustments[0]), this.get(address + adjustments[1])]);
    }

    reset(start = 0, end = this.values.length - 1) {
        this.values.fill(0, start, end + 1);
    }
}