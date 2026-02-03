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
            text: "#1A1A1A",
            sp: "#9B1F5C",
            stack: "#C05A8A",
            ip: "#1F4E73",
            instruction: "#1E6FB8",
            instructionHover: "#D9E7F5",
            A: "#2F5A16",
            B: "#9A5206",
            C: "#4A176F",
            D: "#B71818",
            textDisplay: "#F4F5F7",
            background: "#FFFFFF",
            divider: "#DADDE2" 
        } : {
            text: "#D4D4D4",
            sp: "#BB3071",
            stack: "#F59CC5",
            ip: "#2F608B",
            instruction: "#79B4EB",
            instructionHover: "#10284F",
            A: "#3D691D",
            B: "#C06A08",
            C: "#60218E",
            D: "#E81E1E",
            textDisplay: "#0F0F0F",
            background: "#000000",
            divider: "#2F3336"
        };

        this.gradients = {
            spIp: this.getGradient("#BB3071", "#2F608B")
        };
    }

    render() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        const IP = this.assembler.cpuRegisters.getValue("IP");
        const SP = this.assembler.cpuRegisters.getValue("SP");

        for(let i = 0; i < this.matrix.length; i++) {
            const row = Math.floor(i / this.cellProps.columns);
            const column = i % this.cellProps.columns;

            const x = column * this.cellProps.width;
            const y = row * this.cellProps.height;

            const cellColor = this.getCellColor(i, IP, SP);

            this.ctx.fillStyle = cellColor;
            this.ctx.fillRect(x, y, this.cellProps.width, this.cellProps.height);

            if(
                cellColor === this.colors.instruction ||
                cellColor === this.colors.stack
            ) this.ctx.fillStyle = this.colors.background;

            else this.ctx.fillStyle = this.colors.text;

            this.ctx.fillText(
                this.hexTable[this.matrix[i]],
                x + this.cellProps.width / 2,
                y + this.textYOffset
            );
        }

        this.renderBorders();
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

        if(this.ram.instructions.includes(cell)) {
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
        const isInteractive = cell === IP || this.ram.instructions.includes(cell);

        if(isInteractive) {
            this.canvas.style.cursor = "pointer";
            this.hoveredCell = cell;
        }

        else this.unhoverCell();
    }

    unhoverCell() {
        this.canvas.style.cursor = "default";
        this.hoveredCell = -1;
    }
}