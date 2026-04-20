export class MemoryRenderer {
    constructor(canvas, ctx, assembler, cellProps, hoveredCell, theme) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.assembler = assembler;
        this.cellProps = cellProps;

        this.hoveredCell = hoveredCell;

        this.theme = theme;

        this.matrix = assembler.ram.matrix.getMatrix();
        this.prevMatrix = new Uint8Array(this.matrix.length);
        
        this.prevIP = -1;
        this.prevSP = -1;

        this.prevStackCells = new Set(); // We have to keep track of stack cells in the previous snapshot for synchronous coloring.
        this.prevHltInstructions = new Set();

        this.hexTable = Array.from({ length: 256 }, (_, i) =>
            i.toString(16).toUpperCase().padStart(2, "0")
        );

        this.ctx.font = "14px SourceCodePro-Regular";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        this.textYOffset = Math.round(this.cellProps.height * 0.53); // 0.53 is a constant used to make cells exactly centered relative to rows.

        this.colors = this.getThemeColors(theme);

        this.gradients = {
            spIp: this.getGradient(this.colors.sp, this.colors.ip)
        };
    }

    updateTheme(theme) {
        this.theme = theme;
        this.colors = this.getThemeColors(theme);

        this.gradients = {
            spIp: this.getGradient(this.colors.sp, this.colors.ip)
        };
    }

    // ram is passed as a parameter of the method .render simply because we need updated properties of ram for this method
    initRender(ram) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        const IP = this.assembler.cpuRegisters.getValue("IP");
        const SP = this.assembler.cpuRegisters.getValue("SP");

        for(let i = 0; i < this.matrix.length; i++) this.renderCell(ram, i, IP, SP);

        this.renderBorders();
    }

    // ram is passed as a parameter of the method .render simply because we need updated properties of ram for this method
    render(ram) {
        const IP = this.assembler.cpuRegisters.getValue("IP");
        const SP = this.assembler.cpuRegisters.getValue("SP");

        const updatedCells = new Set();

        // Edge case: Marking detected HLT instructions.
        for(const prevHltInstruction of this.prevHltInstructions) {
            updatedCells.add(prevHltInstruction);
            this.prevHltInstructions.delete(prevHltInstruction);
        }

        for(let i = 0; i < this.matrix.length; i++) {
            if(this.matrix[i] !== this.prevMatrix[i]) updatedCells.add(i);
            
            // Edge case: HLT instruction
            if(this.matrix[i] === 0 && ram.instructions.has(i)) {
                updatedCells.add(i);
                this.prevHltInstructions.add(i);
            }
        }

        // It is important to also update the coloring of IP and SP.
        if(IP !== this.prevIP) {
            updatedCells.add(IP);
            updatedCells.add(this.prevIP);
        }

        if(SP !== this.prevSP) {
            updatedCells.add(SP);
            updatedCells.add(this.prevSP);
        }

        // We have to add all cells that are in stack in order to have synchronous coloring.
        for(let stackCell = SP + 1; stackCell <= ram.stackStart; stackCell++) updatedCells.add(stackCell);

        for(const prevStackCell of this.prevStackCells) {
            updatedCells.add(prevStackCell);
            this.prevStackCells.delete(prevStackCell);
        }

        for(const cell of updatedCells) this.renderCell(ram, cell, IP, SP);

        this.prevMatrix.set(this.matrix);

        this.prevIP = IP;
        this.prevSP = SP;

        this.renderBorders();
    }

    renderRegisterCells(coloredRegisters) {
        for(const cell in this.assembler.cpuRegisters.collection) {
            if(Object.hasOwn(this.assembler.cpuRegisters.collection, cell)) {
                const register = this.assembler.cpuRegisters.collection[cell];
                this.renderCell(null, cell, null, null, register, coloredRegisters);
            }
        }
    }

    renderCell(ram, cell, IP, SP, register = null, coloredRegisters) {
        const row = Math.floor(cell / this.cellProps.columns);
        const column = cell % this.cellProps.columns;

        const x = column * this.cellProps.width;
        const y = row * this.cellProps.height;

        const cellColor = register !== null ? this.getRegisterCellColor(cell, register, coloredRegisters) : this.getCellColor(ram, cell, IP, SP);

        this.ctx.fillStyle = cellColor;
        this.ctx.fillRect(x + 1, y, this.cellProps.width - 1, this.cellProps.height); // +-1 corrections are due to left border being over-drawn because of the cell's background.

        this.ctx.fillStyle = this.colors.text;

        this.ctx.fillText(
            this.hexTable[this.matrix[cell]],
            x + this.cellProps.width / 2,
            y + this.textYOffset
        );
    }

    getCellColor(ram, cell, IP, SP) {
        if(cell === SP && cell === IP) {
            if(cell === this.hoveredCell) return this.colors.instructionHover;
            return this.gradients.spIp;
        }

        if(cell === SP) return this.colors.sp;
        
        if(cell === IP) {
            if(cell === this.hoveredCell) return this.colors.instructionHover;
            return this.colors.ip;
        }

        if(cell > SP && cell <= ram.stackStart) {
            this.prevStackCells.add(cell);
            return this.colors.stack;
        }

        if(ram.instructions.has(cell)) {
            if(cell === this.hoveredCell) return this.colors.instructionHover;
            return this.colors.instruction;
        }

        if(cell >= 0x1000 && cell <= 0x101F) return this.colors.textDisplay;

        return this.colors.background;
    }

    getRegisterCellColor(cell, register, coloredRegisters) {
        if(coloredRegisters[register]) return this.colors[register];
        if(cell >= 0x1000 && cell <= 0x101F) return this.colors.textDisplay;
        return this.colors.background;
    }

    getGradient(firstColor, secondColor) {
        const gradient = this.ctx.createLinearGradient(0, this.cellProps.height, this.cellProps.width, 0);

        gradient.addColorStop(0.0, firstColor);
        gradient.addColorStop(0.5, firstColor);
        gradient.addColorStop(0.5, secondColor);
        gradient.addColorStop(1.0, secondColor);

        return gradient;
    }

    // ram is passed as a parameter of the method .render simply because we need updated properties of ram for this method
    hoverCell(ram, cell) {
        const IP = this.assembler.cpuRegisters.getValue("IP");
        const SP = this.assembler.cpuRegisters.getValue("SP");

        const isInteractive = cell === IP || ram.instructions.has(cell);

        if(isInteractive) {
            this.canvas.style.cursor = "pointer";
            
            const oldHoveredCell = this.hoveredCell;
            this.hoveredCell = cell;

            this.renderCell(ram, cell, IP, SP);
            if(oldHoveredCell !== -1) this.renderCell(ram, oldHoveredCell, IP, SP); // Resetting the previously hovered cell.
        }

        else if(this.hoveredCell !== 1) this.unhoverCell(ram);
    }

    unhoverCell(ram) {
        const IP = this.assembler.cpuRegisters.getValue("IP");
        const SP = this.assembler.cpuRegisters.getValue("SP");

        this.canvas.style.cursor = "default";
        
        const oldHoveredCell = this.hoveredCell;
        this.hoveredCell = -1;

        this.renderCell(ram, oldHoveredCell, IP, SP);
    }

    renderBorders() {
        this.ctx.strokeStyle = this.colors.divider;
        this.ctx.lineWidth = 1;

        this.ctx.beginPath();

        for(let column = 0; column < this.cellProps.columns; column++) {
            const x = column * this.cellProps.width;

            // 0.5 is a dpi constant (1 / 2).
            this.ctx.moveTo(x + 0.5, 0);
            this.ctx.lineTo(x + 0.5, this.ctx.canvas.height);
        }

        this.ctx.stroke();
    }

    getThemeColors(theme) {
        switch(theme) {
            case "dark": return {
                text: "#D4D4D4",
                sp: "#BB3071",
                stack: "#C77399",
                ip: "#122A4A",
                instruction: "#3D75A6",
                instructionHover: "#071835",
                A: "#3D691D",
                B: "#C06A08",
                C: "#60218E",
                D: "#E81E1E",
                textDisplay: "#0F0F0F",
                background: "#000000",
                divider: "#2F3336"
            }

            case "light": return {
                text: "#4D4D4D",
                sp: "#E07AA8",
                stack: "#F8C7DD",
                ip: "#7FAED6",
                instruction: "#B9DCF7",
                instructionHover: "#7F9FCF",
                A: "#8FC97A",
                B: "#F2B36A",
                C: "#B48AE3",
                D: "#F58A8A",
                textDisplay: "#CDCFCF",
                background: "#F5F5F5",
                divider: "#DADDE2" 
            }

            case "classic": return {
                text: "#5C3828",
                sp: "#df689c",
                stack: "#d0879e",
                ip: "#e6964f",
                instruction: "#C4A050",
                instructionHover: "#a97624",
                A: "#6A9E48",
                B: "#C87A20",
                C: "#9f67c7",
                D: "#e85b5b",
                textDisplay: "#F8EDD1",
                background: "#FDF6E3",
                divider: "#E5D0A5"
            }

            case "ocean": return {
                text: "#90C0D8",
                sp: "#C02850",
                stack: "#792b3e",
                ip: "#102737",
                instruction: "#2A5878",
                instructionHover: "#060E18",
                A: "#3D7855",
                B: "#C07030",
                C: "#5040A0",
                D: "#D03040",
                textDisplay: "#0A1A28",
                background: "#050F18",
                divider: "#1C3850"
            }

            case "forest": return {
                text: "#90B880",
                sp: "#7A6020",
                stack: "#A88840",
                ip: "#0C2810",
                instruction: "#286840",
                instructionHover: "#071808",
                A: "#4A8828",
                B: "#B07820",
                C: "#5E2A8A",
                D: "#C83030",
                textDisplay: "#0A1A0C",
                background: "#060E07",
                divider: "#1C4A28"
            }

            case "ruby": return {
                text: "#D8A0B0",
                sp: "#C02850",
                stack: "#E06080",
                ip: "#28080E",
                instruction: "#601828",
                instructionHover: "#180408",
                A: "#3c6920",
                B: "#C07020",
                C: "#6030A0",
                D: "#E04060",
                textDisplay: "#1A080F",
                background: "#100508",
                divider: "#48182A"
            }
        }
    }
}