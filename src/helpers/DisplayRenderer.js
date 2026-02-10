export class DisplayRenderer {
    constructor(canvas, sharedCanvas, assembler) {
        this.canvas = canvas;
        this.sharedCanvas = sharedCanvas;
        this.assembler = assembler;
        
        this.gl = null;
        this.program = null;
        this.texture = null;
        this.frameBuffer = null;
        
        this.isInitialized = false;
    }

    initializeWebGL() {
        const gl = this.canvas.getContext("webgl", { 
            premultipliedAlpha: false,
            antialias: false,
            preserveDrawingBuffer: true
        });

        this.canvas.height = 256;
        this.canvas.width = 256;

        this.gl = gl;

        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_texCoord;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_texCoord = a_texCoord;
            }
        `;

        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);

        const fragmentShaderSource = `
            precision mediump float;
            varying vec2 v_texCoord;
            uniform sampler2D u_texture;
            
            void main() {
                gl_FragColor = texture2D(u_texture, v_texCoord);
            }
        `;

        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        const program = this.createProgram(vertexShader, fragmentShader);
        this.program = program;

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        const positions = new Float32Array([
            -1, -1,
            1, -1,
            -1,  1,
            1,  1,
        ]);

        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const textCoordinationBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textCoordinationBuffer);

        const textCoordinations = new Float32Array([
            0, 1,
            1, 1,
            0, 0,
            1, 0,
        ]);

        gl.bufferData(gl.ARRAY_BUFFER, textCoordinations, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, "a_position");
        const textCoordinationsLocation = gl.getAttribLocation(program, "a_texCoord");

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, textCoordinationBuffer);
        gl.enableVertexAttribArray(textCoordinationsLocation);
        gl.vertexAttribPointer(textCoordinationsLocation, 2, gl.FLOAT, false, 0, 0);

        const texture = gl.createTexture();
        this.texture = texture;

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // If shared imageData wasn't initialized yet, do it once.
        if(!this.sharedCanvas.current.imageData) {
            const imageData = new ImageData(256, 256);
            this.sharedCanvas.current.imageData = imageData;
        }

        const frameBuffer = new Uint32Array(this.sharedCanvas.current.imageData.data.buffer);
        this.frameBuffer = frameBuffer;

        this.updateTexture();
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);

        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();

        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if(!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            this.gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }

    updateTexture() {
        const gl = this.gl;
        if(!gl) return;

        gl.useProgram(this.program);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            256,
            256,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            this.sharedCanvas.current.imageData.data
        );

        gl.viewport(0, 0, 256, 256);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    redrawCanvas(data) {
        const vidMode = this.assembler.ioRegisters.getValue("VIDMODE");

        // Bitmap
        if(vidMode > 1) {
            // data is "clear" only if "graphicsRedraw" is triggered when VIDMODE is set to 3 (CLEAN).
            if(data === "clear") this.drawBackground({ isBitmap: true });

            // data is properly defined, meaning "graphicsRedraw" is triggered by the updating system.
            else {
                for(let i = 0; i < data.length; i++) this.drawPixel(data[i]);
                this.updateTexture();
            }
        }

        // Text
        else {
            const [scrollX, scrollY] = this.assembler.graphics.getReserved("scroll");
            const text = this.assembler.graphics.getText();
            
            const vram = this.assembler.graphics.matrix.getMatrix();

            // BACKGROUND
            this.drawBackground();

            // CHARACTERS
            this.assembler.graphics.forEachCharacter(address => {
                const ascii = vram[address];

                const colorIndex = vram[address + 1];
                const color = this.assembler.graphics.getRGBFromVRAM(colorIndex);

                const [x, y] = this.assembler.graphics.addressToPosition(address);
                this.drawCharacter([x, y, ascii, color], scrollX, scrollY, text);
            });

            // SPRITES
            this.assembler.graphics.forEachSprite((styleAddress, positionAddress) => {
                const ascii = vram[styleAddress];

                const colorIndex = vram[styleAddress + 1];
                const color = this.assembler.graphics.getRGBFromVRAM(colorIndex);

                const x = vram[positionAddress];
                const y = vram[positionAddress + 1];

                this.drawSprite([x, y, ascii, color], text);
            });
                
            this.updateTexture();
        }
    }

    drawMemory() {
        const vram = this.assembler.graphics.matrix.getMatrix();

        for(let address = 0; address < vram.length; address++) {
            const [x, y] = this.assembler.graphics.addressToPosition(address);

            const colorIndex = this.assembler.graphics.matrix.point(address);
            const color = this.assembler.graphics.getRGB(colorIndex & 0xFF);
            
            this.drawPixel([x, y, color]);
        }

        this.updateTexture();
    }

    drawBackground(options) {
        const isBitmap = options?.isBitmap ? options.isBitmap : false;

        const backgroundColor = isBitmap ? { r: 0, g: 0, b: 0 } : this.assembler.graphics.getReserved("background");
        const { r, g, b } = backgroundColor;

        const imageData = this.sharedCanvas.current.imageData;

        for(let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = r;
            imageData.data[i + 1] = g;
            imageData.data[i + 2] = b;
            imageData.data[i + 3] = 255;
        }

        this.updateTexture();
    }

    drawPixel(data) {
        const [x, y, color] = data;
        const { r, g, b } = color;

        const imageData = this.sharedCanvas.current.imageData;
        const screenSize = 256;

        const px = (y * screenSize + x) * 4;

        imageData.data[px] = r;
        imageData.data[px + 1] = g;
        imageData.data[px + 2] = b;
        imageData.data[px + 3] = 255;
    }

    drawCharacter(data, scrollX, scrollY, text) {
        const [x, y, ascii, color] = data;

        const imageData = this.sharedCanvas.current.imageData;

        const character = {
            height: 16,
            width: 8,
            bits: ascii * 32, // 32 bits are reserved for each ASCII character.
            top: y,
            left: x,
            bottom: y * 16,
            right: x * 8
        };
        
        const screenSize = 256;

        const screen = {
            x: character.right - scrollX,
            y: character.bottom - scrollY
        };

        // We need to check if character is totally off the screen.
        if(
            screen.x <= -character.width * 2 ||
            screen.x >= screenSize ||
            screen.y <= -character.height ||
            screen.y >= screenSize
        ) return;

        for(let i = 0; i < character.height; i++) {
            const y = screen.y + i;
            if(y < 0 || y >= screenSize) continue; // This line of pixels is off the screen on y.
            
            const firstHalf = text[character.bits + i * 2];
            const secondHalf = text[character.bits + i * 2 + 1];
                
            const lineBits = (firstHalf << 8) | secondHalf;

            for(let j = 0; j < character.width * 2; j++) {
                const x = screen.x + j;
                if(x < 0 || x >= screenSize) continue; // This pixel is off the screen on x.
                
                const lineBit = (lineBits >> (15 - j)) & 1;
                if(lineBit === 0) continue; // This means that specific pixel is "transparent". 

                const px = (y * screenSize + x) * 4;

                imageData.data[px] = color.r;
                imageData.data[px + 1] = color.g;
                imageData.data[px + 2] = color.b;
                imageData.data[px + 3] = 255;
            }
        }
    }

    drawSprite(data, text) {
        const [x, y, ascii, color] = data;

        const imageData = this.sharedCanvas.current.imageData;

        const character = {
            height: 16,
            width: 8,
            bits: ascii * 32, // 32 bits are reserved for each ASCII character.
            top: y,
            left: x,
            bottom: y * 16,
            right: x * 8
        };
        
        const screenSize = 256;

        for(let i = 0; i < character.height; i++) {
            const firstHalf = text[character.bits + i * 2];
            const secondHalf = text[character.bits + i * 2 + 1];
                
            const lineBits = (firstHalf << 8) | secondHalf;

            for(let j = 0; j < character.width * 2; j++) {
                const lineBit = (lineBits >> (15 - j)) & 1;
                if(lineBit === 0) continue; // This means that specific pixel is "transparent".

                const px = ((y + i) * screenSize + (x + j)) * 4;

                imageData.data[px] = color.r;
                imageData.data[px + 1] = color.g;
                imageData.data[px + 2] = color.b;
                imageData.data[px + 3] = 255;
            }
        }
    }

    resetCanvas() {
        this.frameBuffer.fill(0xFF000000);
        this.updateTexture();
    }

    cleanup() {
        if(this.gl) {
            if(this.texture) {
                this.gl.deleteTexture(this.texture);
                this.texture = null;
            }

            if(this.program) {
                this.gl.deleteProgram(this.program);
                this.program = null;
            }
        }

        this.isInitialized = false;
    }
}