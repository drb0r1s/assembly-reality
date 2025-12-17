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

    arrayify(options) {
        if(options?.miniDisplay) return Array.from(this.values.slice(-32));
        return Array.from(this.values);
    }

    reset() {
        this.values.fill(0);
    }
}