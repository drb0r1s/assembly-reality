export const Autosave = {
    items: [
        ["IS_AUTOSAVE_ACTIVE", false],
        ["CODE", null]
    ],
    
    initialize: () => {
        for(let i = 0; i < Autosave.items.length; i++) {
            const item = Autosave.items[i];

            const existingItem = Autosave.getItem(item[0]);
            if(existingItem !== null) continue;
            
            Autosave.setItem(item[0], item[1]);
        }
    },

    getItem: item => {
        return JSON.parse(localStorage.getItem(`ASSEMBLY_REALITY_${item}`));
    },

    setItem: (item, value) => {
        localStorage.setItem(`ASSEMBLY_REALITY_${item}`, JSON.stringify(value));
    }
};