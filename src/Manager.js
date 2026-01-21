export const Manager = (() => {
    const values = new Map([
        ["view", { memory: true, ioDevices: true, cpuRegisters: true, ioRegisters: true }],
        ["speed", 4],
        ["isHighSpeed", false],
        ["isRunning", false],
        ["isDisplayExpanded", false],
        ["isAutosaveActive", false],
        ["isCodeEmpty", true],
        ["isCodeAssembled", false],
        ["isCodeExecuted", false]
    ]);
    
    const listeners = new Map();

    return {
        get: key => {
            return values.get(key);
        },

        set: (key, value) => {
            values.set(key, value);
            Manager.trigger(key, value);
        },

        delete: key => {
            values.delete(key);
        },

        trigger: (event, data) => {
            const eventListeners = listeners.get(event);
            if(!eventListeners) return;
            
            for(const callback of eventListeners) callback(data);
        },

        subscribe: (event, callback) => {
            if(!listeners.has(event)) listeners.set(event, new Set());

            const eventListeners = listeners.get(event);
            eventListeners.add(callback);

            return () => eventListeners.delete(callback);
        }
    };
})();