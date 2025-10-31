export const HexCalculator = {
    add: (first, second, options) => {
        const length = options?.isHalf ? 2 : 4;
        return (parseInt(first, 16) + parseInt(second, 16)).toString(16).toUpperCase().padStart(length, "0");
    },

    sub: (first, second, options) => {
        const length = options?.isHalf ? 2 : 4;

        let intFirst = parseInt(first, 16);
        let intSecond = parseInt(second, 16);

        if(intFirst < intSecond) {
            intSecond -= intFirst + 1; // Because of negative difference, we need to lower the second value by an additional 1, for synchronization.
            intFirst = 65535; // Value is set to 0xFFFF.
        }

        return (intFirst - intSecond).toString(16).toUpperCase().padStart(length, "0");
    },

    mul: (first, second, options) => {
        const length = options?.isHalf ? 2 : 4;
        
    }
};