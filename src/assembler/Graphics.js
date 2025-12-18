import { Matrix } from "./Matrix";

export class Graphics {
    constructor(memoryBuffer) {
        this.matrix = new Matrix(memoryBuffer);
        this.rgbTable = new Array(256);

        for(let i = 0; i < 256; i++) {
            const r = ((i >> 5) & 0x07) * 255 / 7 | 0;
            const g = ((i >> 2) & 0x07) * 255 / 7 | 0;
            const b = (i & 0x03) * 255 / 3 | 0;
            
            this.rgbTable[i] = { r, g, b };
        }
    }
    
    getRGB(value) {
        return this.rgbTable[value];
    }

    addressToPosition(address) {
        const x = address & 0xFF;
        const y = address >> 8;

        return [x, y];
    }

    reset() {
        this.matrix.reset();
    }
}