import { Matrix } from "./Matrix";

export class Graphics {
    constructor(memoryBuffer) {
        this.matrix = new Matrix(memoryBuffer);
    }
    
    memoryWrite(address, value) {
        
    }

    reset() {
        this.matrix.reset();
    }
}