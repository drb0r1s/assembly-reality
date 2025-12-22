import { Matrix } from "./Matrix";
import { TextModeData } from "./TextModeData";

export class Graphics {
    constructor(graphicsBuffer) {
        this.matrix = new Matrix(graphicsBuffer, 256);

        // Initializing text and pallete, by writing them in graphics memory on specific addresses.
        this.matrix.values.set(TextModeData.TEXT, TextModeData.TEXT_START);
        this.matrix.values.set(TextModeData.PALETTE, TextModeData.PALETTE_START);

        this.rgbTable = new Array(256);

        for(let i = 0; i < 256; i++) {
            const r = ((i >> 5) & 0x07) * 255 / 7 | 0;
            const g = ((i >> 2) & 0x07) * 255 / 7 | 0;
            const b = (i & 0x03) * 255 / 3 | 0;
            
            this.rgbTable[i] = { r, g, b };
        }

        this.storedBits = []; // An array of bits waiting to be updated in bitmap mode for speeds < 10kHz.
        this.storedCharacters = []; // An array of characters waiting to be updated in text mode for speeds < 10kHz.
    }
    
    getRGB(value) {
        return this.rgbTable[value];
    }

    addressToPosition(address) {
        const x = address % 256;
        const y = Math.floor(address / 256);
        
        return [x, y];
    }

    update(assembler, value) {
        const vidMode = assembler.ioRegisters.getValue("VIDMODE");
        const vidAddr = assembler.ioRegisters.getValue("VIDADDR");

        assembler.graphics.matrix.update(vidAddr, value, { isHalf: vidMode > 1 });

        // If we're in bitmap mode, then yes, drawing is certain.
        if(vidMode > 1) this.draw(assembler, value);

        // In case we're in the text mode, then it is not certain that we're drawing on the screen, maybe reserved address is updated.
        else this.updateTextModeAddress(assembler, value);
    }

    draw(assembler, value) {
        const vidAddr = assembler.ioRegisters.getValue("VIDADDR");
        const [x, y] = this.addressToPosition(vidAddr);

        // For speeds greather than or equal to 10kHz, we update the canvas instantly.
        if(assembler.speed >= 10000) {
            // Bitmap
            if(vidMode > 1) self.postMessage({ action: "graphicsRedraw", data: [[x, y, this.getRGB(value)]]});

            // Text
            else {
                const ascii = (value >> 8) & 0xFF;
                const color = value & 0xFF;

                self.postMessage({ action: "graphicsRedraw", data: [[x, y, ascii, this.getRGB(color)]]});
            }
        }

        // In case speed is < 10kHz, we need to keep track of all bits/characters that should be updated.
        else {
            // Bitmap
            if(vidMode > 1) this.storageAdd("bitmap", [x, y, this.getRGB(value)]);

            // Text
            else {
                const ascii = (value >> 8) & 0xFF;
                const color = value & 0xFF;

                this.storageAdd("text", [x, y, ascii, this.getRGB(color)]);
            }
        }
    }

    updateTextModeAddress(assembler, value) {
        const vidAddr = assembler.ioRegisters.getValue("VIDADDR");
        
        // [0x0000, 0x7FFF] is reserved for display.
        if(vidAddr <= 0x7FFF) this.draw(assembler, value);

        // [0xA300, 0xA301] is reserved for background color.
        if(vidAddr === 0xA300 || vidAddr === 0xA301) self.postMessage({ action: "graphicsRedraw", data: ["background"] });
    }

    storageGet(mode) {
        if(mode === "bitmap") return this.storedBits;
        return this.storedCharacters;
    }

    // This method is used to store bits/characters that are waiting to be displayed on the screen, due to speed/update synchronization (< 10kHz).
    storageAdd(mode, element) {
        if(mode === "bitmap") this.storedBits.push(element);
        else this.storedCharacters.push(element);
    }

    storageClear(mode) {
        if(mode === "bitmap") this.storedBits = [];
        else this.storedCharacters = [];
    }

    reset() {
        this.matrix.reset();
        this.storedBits = [];
        this.storedCharacters = [];
    }
}