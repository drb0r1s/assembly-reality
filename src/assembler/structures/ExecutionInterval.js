export class ExecutionInterval {
    constructor(getSpeed) {
        // .getSpeed is a function, in order to achieve synchronized value with assembler.speed.
        this.getSpeed = getSpeed;
        this.intervalId = null;
    }

    start(callback) {
        const delay = 1000 / this.getSpeed(); // ms per instruction

        // Unreachable speeds (> 1kHz) require < 1ms per instruction, which is not possible in browser.
        // As a solution to that, we're going to execute multiple instructions at once, to simulate that < 1ms speed.
        const isUnreachableSpeed = this.getSpeed() > 1000;

        this.stop();

        if(isUnreachableSpeed) {
            let prevNow = performance.now();
            let leftover = 0;

            // Here we do not want to call one callback immediately, like we do for low speeds.
            this.intervalId = setInterval(() => {
                const now = performance.now();

                const passedTime = now - prevNow;
                prevNow = now;

                // This constant uses the formula to calculate instructions per clock cycle, with respect to leftovers.
                const numberOfInstructions = (passedTime * this.getSpeed()) / 1000 + leftover;
                let instructionsToExecute = Math.floor(numberOfInstructions);

                leftover = numberOfInstructions - instructionsToExecute;

                if(instructionsToExecute <= 0) return;

                // In general, relation between speed and clock cycles is calculated to be approx. speed / 100 = clock cycle.
                // Because of that, we will rely on this constant to speed up the execution if instructionsToExecute is too high.
                const speedToClockCycleRatio = this.getSpeed() / 100;

                while(instructionsToExecute > 0) {
                    // There is a possibility that calculated real instructions per clock cycle (instructionsToExecute) are not fast enough for our simulation.
                    // Because of that, as mentioned above, we use speedToClockCycleRatio.
                    const executedInstructions = Math.min(speedToClockCycleRatio, instructionsToExecute);
                    for(let i = 0; i < executedInstructions; i++) callback();

                    instructionsToExecute -= executedInstructions;
                }
            }, 1);
        }

        else {
            // The first iteration.
            callback();
            this.intervalId = setInterval(callback, delay);
        }
    }

    stop() {
        if(this.intervalId === null) return;

        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    reset() {
        this.stop();
    }
}