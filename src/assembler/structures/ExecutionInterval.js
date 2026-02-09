export class ExecutionInterval {
    constructor(getSpeed) {
        // .getSpeed is a function, in order to achieve synchronized value with assembler.speed.
        this.getSpeed = getSpeed;
        this.interval = { type: "", id: null };
    }

    start(callback) {
        this.stop();

        const speed = this.getSpeed();

        // Unreachable speeds (> 1kHz) require < 1ms per instruction, which is not possible in browser.
        // As a solution to that, we're going to execute multiple instructions at once, to simulate that < 1ms speed.
        if(speed > 1000) {
            let prevNow = performance.now();
            let leftover = 0;
            
            let rafId = null;

            const tick = now => {
                const passedTime = now - prevNow;
                prevNow = now;

                // This constant uses the formula to calculate instructions per clock cycle, with respect to leftovers.
                const numberOfInstructions = (passedTime * speed) / 1000 + leftover;
                let instructionsToExecute = Math.floor(numberOfInstructions);

                leftover = numberOfInstructions - instructionsToExecute;

                // In general, relation between speed and clock cycles is calculated to be approx. speed / 100 = clock cycle.
                // Because of that, we will rely on this constant to speed up the execution if instructionsToExecute is too high.
                const speedToClockCycleRatio = speed / 100;

                // There is a possibility that calculated real instructions per clock cycle (instructionsToExecute) are not fast enough for our simulation.
                // Because of that, as mentioned above, we use speedToClockCycleRatio.
                const executedInstructions = Math.min(speedToClockCycleRatio, instructionsToExecute);
                for(let i = 0; i < executedInstructions; i++) callback();

                rafId = requestAnimationFrame(tick);

                this.interval = { type: "raf", id: rafId };
            }

            rafId = requestAnimationFrame(tick);
        }

        else {
            // The first iteration.
            callback();

            const delay = 1000 / speed; // ms per instruction
            const intervalId = setInterval(callback, delay);

            this.interval = { type: "interval", id: intervalId };
        }
    }

    stop() {
        if(this.interval.id === null) return;

        if(this.interval.type === "interval") clearInterval(this.interval.id);
        else cancelAnimationFrame(this.interval.id);

        this.interval = { type: "", id: null };
    }

    reset() {
        this.stop();
    }
}