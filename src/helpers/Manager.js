import { Autosave } from "./Autosave";

export const Manager = (() => {
    const values = new Map([
        ["view", { memory: true, ioDevices: true, cpuRegisters: true, ioRegisters: true }],
        ["speed", Autosave.conditionalGetItem("SPEED")],
        ["isHighSpeed", false],
        ["isRunning", false],
        ["isExecuted", false],
        ["isDisplayExpanded", false],
        ["isAutosaveActive", Autosave.getItem("IS_AUTOSAVE_ACTIVE")],
        ["isCodeEmpty", true],
        ["isCodeAssembled", false]
    ]);
    
    const listeners = new Map();
    const events = new Map();

    let isSequence = false;
    
    function triggerEvent(event, data) {
        const eventListeners = listeners.get(event);
        if(!eventListeners) return;

        for(const eventListener of eventListeners) eventListener(data);
    }

    return {
        get: key => {
            return values.get(key);
        },

        set: (key, value) => {
            values.set(key, value);

            if(isSequence) events.set(key, value);
            else triggerEvent(key, value);
        },

        delete: key => {
            values.delete(key);
        },

        trigger: (event, data) => {
            if(isSequence) {
                events.set(event, data);
                return;
            }

            triggerEvent(event, data);
        },

        subscribe: (event, callback) => {
            if(!listeners.has(event)) listeners.set(event, new Set());

            const eventListeners = listeners.get(event);
            eventListeners.add(callback);

            return () => eventListeners.delete(callback);
        },

        sequence: callback => {
            isSequence = true;
            callback();
            isSequence = false;

            for(const [event, data] of events) triggerEvent(event, data);

            events.clear();
        }
    };
})();