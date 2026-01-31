export class MemoryRenderer {
    constructor(ctx, assembler, ram, cell) {
        this.ctx = ctx;
        this.assembler = assembler;
        this.ram = ram;
        this.cell = cell;

        this.matrix = assembler.ram.matrix.getMatrix();

        this.hexTable = Array.from({ length: 256 }, (_, i) =>
            i.toString(16).toUpperCase().padStart(2, "0")
        );

        this.ctx.font = "14px SourceCodePro-Regular";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        this.textYOffset = Math.round(this.cell.height * 0.53); // 0.53 is a constant used to make cells exactly centered relative to rows.

        this.colors = {
            text: "#D4D4D4",
            ip: "#2F608B",
            instruction: "#79b4eb",
            sp: "#BB3071",
            stack: "#F59CC5",
            textDisplay: "#0F0F0F",
            background: "#000000",
            divider: "#2F3336"
        };
    }

    render() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        const IP = this.assembler.cpuRegisters.getValue("IP");
        const SP = this.assembler.cpuRegisters.getValue("SP");

        for(let i = 0; i < this.matrix.length; i++) {
            const row = Math.floor(i / 16);
            const column = i % 16;

            const x = column * this.cell.width;
            const y = row * this.cell.height;

            const cellColor = this.getCellColor(i, IP, SP)

            this.ctx.fillStyle = cellColor;
            this.ctx.fillRect(x, y, 24, 20);

            if(
                cellColor === this.colors.instruction ||
                cellColor === this.colors.stack
            ) this.ctx.fillStyle = this.colors.background;

            else this.ctx.fillStyle = this.colors.text;

            this.ctx.fillText(
                this.hexTable[this.matrix[i]],
                x + this.cell.width / 2,
                y + this.textYOffset
            );
        }

        this.renderBorders();
    }

    renderBorders() {
        this.ctx.strokeStyle = this.colors.divider;
        this.ctx.lineWidth = 1;

        this.ctx.beginPath();

        for (let column = 0; column < 16; column++) {
            const x = column * 24;

            // 0.5 is a dpi constant (1 / 2).
            this.ctx.moveTo(x + 0.5, 0);
            this.ctx.lineTo(x + 0.5, this.ctx.canvas.height);
        }

        this.ctx.stroke();
    }

    getCellColor(index, IP, SP) {
        if(index === SP) return this.colors.sp;
        if(index === IP) return this.colors.ip;

        if(this.ram.instructions.includes(index)) return this.colors.instruction;
        if (index > SP && index <= this.ram.stackStart) return this.colors.stack;
        if (index >= 0x1000 && index <= 0x101F) return this.colors.textDisplay;

        return this.colors.background;
    }
}