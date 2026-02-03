export const Autosave = {
    items: {
        IS_LIGHT_THEME: false,
        IS_AUTOSAVE_ACTIVE: false,
        CODE: null,
        SPEED: 4
    },
    
    initialize: () => {
        Object.keys(Autosave.items).forEach((key, index) => {
            const value = Object.values(Autosave.items)[index];

            const existingItem = Autosave.getItem(key);
            if(existingItem !== null) return;

            Autosave.setItem(key, value);
        });
    },

    getItem: item => {
        return JSON.parse(localStorage.getItem(`ASSEMBLY_REALITY_${item}`));
    },

    // Item will only be returned if autosave is active.
    // If autosave if disabled, the requested item will be returned to its default value.
    conditionalGetItem: item => {
        const isAutosaveActive = Autosave.getItem("IS_AUTOSAVE_ACTIVE");
        if(isAutosaveActive) return Autosave.getItem(item);

        Autosave.setItem(item, Autosave.items[item]); // Return the default value.
        return Autosave.items[item];
    },

    setItem: (item, value) => {
        localStorage.setItem(`ASSEMBLY_REALITY_${item}`, JSON.stringify(value));
    }
};