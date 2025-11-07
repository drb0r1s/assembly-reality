export const ByteNumber = {
    divide: number => {
        return [(number >>> 8) & 0xFF, number & 0xFF];
    },

    join: dividedNumber => {
        const [first, second] = dividedNumber;
        return (first << 8) | second;
    }
};