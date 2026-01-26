export class Lines {
    constructor() {
        this.collection = {};
    }

    collect(line, ram) {
        const row = ram.free.i;
        const column = ram.free.j;

        this.collection = {
            ...this.collection,
            [ram.matrix.getAddress(row, column)]: line
        };
    }

    reset() {
        this.collection = {};
    }
}