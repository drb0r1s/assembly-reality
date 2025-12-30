import { Matrix } from "../structures/Matrix";
import { TextModeData } from "../data/TextModeData";
import { Interrupts } from "../helpers/Interrupts";

export class Graphics {
    constructor(graphicsBuffer) {
        this.matrix = new Matrix(graphicsBuffer, 256);

        // Initializing text and pallete, by writing them in graphics memory on specific addresses.
        this.matrix.values.set(TextModeData.TEXT, TextModeData.TEXT_START);
        this.matrix.values.set(TextModeData.PALETTE, TextModeData.PALETTE_START);

        // [0x8000, 0x9FFF] is reserved for text.
        this.text = this.matrix.values.subarray(TextModeData.TEXT_START, TextModeData.TEXT_END + 1);
        // [0xA000, 0xA2FF] is reserved for palette.
        this.palette = this.matrix.values.subarray(TextModeData.PALETTE_START, TextModeData.PALETTE_END + 1);

        this.rgbTable = new Array(256);

        for(let i = 0; i < 256; i++) {
            const r = ((i >> 5) & 0x07) * 255 / 7 | 0;
            const g = ((i >> 2) & 0x07) * 255 / 7 | 0;
            const b = (i & 0x03) * 255 / 3 | 0;
            
            this.rgbTable[i] = { r, g, b };
        }

        this.storedBits = []; // An array of bits waiting to be updated in bitmap mode for speeds < 10kHz.
        this.intervalId = null;
    }

    getReserved(key) {
        switch(key) {
            case "background":
                const backgroundColorIndex = this.matrix.point(0xA301, { isHalf: true });
                return this.getRGBFromVRAM(backgroundColorIndex);
            case "scroll":
                return [
                    this.matrix.point(0xA302),
                    this.matrix.point(0xA304)
                ];
        }
    }

    getText() {
        return this.text;
    }

    getPalette() {
        return this.palette;
    }
    
    getRGB(value) {
        return this.rgbTable[value];
    }

    getRGBFromVRAM(value) {
        const base = value * 3;

        const r = this.palette[base];
        const g = this.palette[base + 1];
        const b = this.palette[base + 2];

        return { r, g, b };
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
        if(vidMode > 1) this.drawBit(assembler, value);
    }

    drawBit(assembler, value) {
        const vidMode = assembler.ioRegisters.getValue("VIDMODE");

        const vidAddr = assembler.ioRegisters.getValue("VIDADDR");
        const [x, y] = this.addressToPosition(vidAddr);

        // For speeds greather than or equal to 10kHz, we update the canvas instantly.
        if(assembler.speed >= 10000) {
            // Bitmap
            if(vidMode > 1) self.postMessage({ action: "graphicsRedraw", data: [[x, y, this.getRGB(value & 0xFF)]]});
        }

        // In case speed is < 10kHz, we need to keep track of all bits that should be updated.
        else if(vidMode > 1) this.storeBit([x, y, this.getRGB(value & 0xFF)]);
    }

    forEachCharacter(callback) {
        // [0x0000, 0x7FFF] is reserved for display.
        for(let address = 0; address <= 0x7FFF; address += 2) callback(address);
    }

    forEachSprite(callback) {
        // [0xA306, 0xA325] is reserved for sprites.
        // The format (address, address + 2) represents (styleAddress, positionAddress).
        for(let address = 0xA306; address <= 0xA325; address += 4) {
            const ascii = this.matrix.point(address, { isHalf: true });
            if(ascii === 0) continue;
            
            callback(address, address + 2);
        }
    }

    getStoredBits() {
        return this.storedBits;
    }

    // This method is used to store bits that are waiting to be displayed on the screen, due to speed/update synchronization (< 10kHz).
    storeBit(bit) {
        this.storedBits.push(bit);
    }

    clearStoredBits() {
        this.storedBits = [];
    }

    startVsyncInterval(assembler) {
        // Having vsync interval only makes sense for speeds over 10kHz, .executeVsync is used otherwise.
        if(assembler.speed < 10000) return;
        this.intervalId = setInterval(() => this.executeVsync(assembler), 20);
    }

    stopVsyncInterval() {
        if(this.intervalId === null) return;

        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    executeVsync(assembler) {
        assembler.keyboard.processEvents();
        self.postMessage({ action: "graphicsRedraw" });
        Interrupts.trigger(assembler, "graphics");
    }

    // .clear is used if VIDMODE is 3, .reset should not be used for that.
    clear() {
        this.matrix.reset();
    }

    reset() {
        this.matrix.reset();

        this.matrix.values.set(TextModeData.TEXT, TextModeData.TEXT_START);
        this.matrix.values.set(TextModeData.PALETTE, TextModeData.PALETTE_START);

        this.storedBits = [];
        
        clearInterval(this.intervalId);
        this.intervalId = null;
    }
}