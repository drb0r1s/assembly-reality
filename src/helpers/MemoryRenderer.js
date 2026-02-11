export class MemoryRenderer {
    constructor(canvas, ctx, assembler, ram, cellProps, hoveredCell, isLightTheme, registerColoring) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.assembler = assembler;
        this.ram = ram;
        this.cellProps = cellProps;

        this.hoveredCell = hoveredCell;

        this.isLightTheme = isLightTheme;
        this.registerColoring = registerColoring;

        this.matrix = assembler.ram.matrix.getMatrix();

        this.hexTable = Array.from({ length: 256 }, (_, i) =>
            i.toString(16).toUpperCase().padStart(2, "0")
        );

        this.ctx.font = "14px SourceCodePro-Regular";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        this.textYOffset = Math.round(this.cellProps.height * 0.53); // 0.53 is a constant used to make cells exactly centered relative to rows.

        this.colors = isLightTheme ? {
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
        } : {
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
        };

        this.gradients = {
            spIp: this.getGradient(this.colors.sp, this.colors.ip)
        };
    }

    render() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        const IP = this.assembler.cpuRegisters.getValue("IP");
        const SP = this.assembler.cpuRegisters.getValue("SP");

        for(let i = 0; i < this.matrix.length; i++) this.renderCell(i, IP, SP);

        this.renderBorders();
    }

    renderCell(cell, IP, SP) {
        const row = Math.floor(cell / this.cellProps.columns);
        const column = cell % this.cellProps.columns;

        const x = column * this.cellProps.width;
        const y = row * this.cellProps.height;

        const cellColor = this.getCellColor(cell, IP, SP);

        this.ctx.fillStyle = cellColor;
        this.ctx.fillRect(x, y, this.cellProps.width, this.cellProps.height);

        this.ctx.fillStyle = this.colors.text;

        this.ctx.fillText(
            this.hexTable[this.matrix[cell]],
            x + this.cellProps.width / 2,
            y + this.textYOffset
        );
    }

    getCellColor(cell, IP, SP) {
        if(cell === SP && cell === IP) {
            if(cell === this.hoveredCell) return this.colors.instructionHover;
            return this.gradients.spIp;
        }

        if(cell === SP) return this.colors.sp;
        
        if(cell === IP) {
            if(cell === this.hoveredCell) return this.colors.instructionHover;
            return this.colors.ip;
        }

        if(cell > SP && cell <= this.ram.stackStart) return this.colors.stack;

        if(this.ram.instructions.has(cell)) {
            if(cell === this.hoveredCell) return this.colors.instructionHover;
            return this.colors.instruction;
        }

        if(this.assembler.cpuRegisters.collection[cell]) {
            const register = this.assembler.cpuRegisters.collection[cell];
            if(this.registerColoring[register]) return this.colors[register];
        }

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

    hoverCell(cell) {
        const IP = this.assembler.cpuRegisters.getValue("IP");
        const SP = this.assembler.cpuRegisters.getValue("SP");

        const isInteractive = cell === IP || this.ram.instructions.has(cell);

        if(isInteractive) {
            this.canvas.style.cursor = "pointer";
            
            const oldHoveredCell = this.hoveredCell;
            this.hoveredCell = cell;

            this.renderCell(cell, IP, SP);
            if(oldHoveredCell !== -1) this.renderCell(oldHoveredCell, IP, SP); // Resetting the previously hovered cell.
        }

        else if(this.hoveredCell !== 1) this.unhoverCell();
    }

    unhoverCell() {
        const IP = this.assembler.cpuRegisters.getValue("IP");
        const SP = this.assembler.cpuRegisters.getValue("SP");

        this.canvas.style.cursor = "default";
        
        const oldHoveredCell = this.hoveredCell;
        this.hoveredCell = -1;

        this.renderCell(oldHoveredCell, IP, SP);
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
}