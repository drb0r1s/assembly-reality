export class ExecutionInterval {
    constructor(getSpeed) {
        // .getSpeed is a function, in order to achieve synchronized value with assembler.speed.
        this.getSpeed = getSpeed;
        this.intervalId = null;
    }

    start(callback, onRefresh) {
        this.stop();

        const speed = this.getSpeed();
        const refreshInterval = this.getRefreshInterval(speed);

        let prevNow = performance.now();
        let instructionAccumulator = 0;
        let lastRefresh = prevNow;

        const tick = now => {
            const difference = now - prevNow;
            prevNow = now;

            instructionAccumulator += (difference * speed) / 1000;

            let instructionsToExecute = Math.floor(instructionAccumulator);
            instructionAccumulator -= instructionsToExecute;

            while(instructionsToExecute > 0) {
                callback();
                instructionsToExecute--;
            }

            if(now - lastRefresh >= refreshInterval) {
                onRefresh();
                lastRefresh = now;
            }

            this.intervalId = requestAnimationFrame(tick);
        }

        this.intervalId = requestAnimationFrame(tick);
    }

    stop() {
        if(this.intervalId === null) return;
        
        cancelAnimationFrame(this.intervalId);
        this.intervalId = null;
    }

    getRefreshInterval(speed) {
        if(speed <= 10) return 40;
        if(speed <= 50) return 200;
        if(speed <= 1000) return 250;
        if(speed <= 2500) return 350;
        if(speed <= 5000) return 450;
        if(speed <= 7500) return 550;
        return 650;
    }

    reset() {
        this.stop();
    }
}