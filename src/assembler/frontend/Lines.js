export class Lines {
    constructor() {
        this.collection = {};
    }

    collect(line, ram) {
        this.collection[ram.free] = line;
    }

    reset() {
        this.collection = {};
    }
}