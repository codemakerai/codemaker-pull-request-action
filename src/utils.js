/**
 * Utility functions
 */

export const isEmptyString = (str) => {
    return str === null
    || str === undefined
    || (typeof str === "string" && str.length === 0);
}
