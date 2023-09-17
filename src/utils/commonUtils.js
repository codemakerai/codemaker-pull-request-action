/**
 * Utility functions
 */

export const isEmptyString = (str) => {
    return str === null
    || str === undefined
    || (typeof str === "string" && str.length === 0);
}

export const stringifyObject = (object, fieldsToIgnore) => {
    return JSON.stringify(object, (key, value) => {
        if (ignoreField(key, fieldsToIgnore)) {
            return undefined;
        }
        return value;
    });
}

/**
 * JSON stringify object and replacing some fields with new.
 * 
 * @param {*} object    The object.
 * @param {*} replacing A map. key: field name; value: replacing value
 * @returns 
 */
export const stringifyObjectAndReplaceValues = (object, replacing) => {
    if (replacing instanceof Map) {
        return JSON.stringify(object, (key, value) => {
            if (replacing.has(key)) {
                return replacing.get(key);
            }
            return value;
        })
    }
    return JSON.stringify(object);
}

const ignoreField = (field, fieldsToIgnore) => {
    if (Array.isArray(fieldsToIgnore)) {
        return fieldsToIgnore.includes(field);
    } else {
        return field === fieldsToIgnore;
    }
}
