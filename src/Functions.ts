import StringToRules from "./StringToRules";

/**
 * Change to string to upperFirst
 * @param str
 * @constructor
 */
export function UpperFirst(str: string): string {
    return str[0].toUpperCase() + str.substr(1)
}

/**
 * Converts an array of rules (string | object)[] to one object rule
 * @example
 * const rule = Rule(['must', {min: 10, max: 20}, '!exact'])
 * // will return
 * { must: true, min: 10, max: 20, exact: false }
 *
 * @param rules
 * @constructor
 */
export function Rule(rules: any[]): any {
    /**
     * Convert to array if not array.
     */
    if (!Array.isArray(rules)) {
        rules = [rules];
    }

    /**
     * Stores generated rules
     */
    let generatedRule = {};

    /**
     * Loop Through each rule
     *
     * 1. convert to object if string
     * 2. add rule to generatedRule object
     */
    for (let rule of rules) {

        if (typeof rule as string === "string")
            rule = StringToRules(rule);

        generatedRule = {...generatedRule, ...rule}
    }

    return generatedRule;
}


export function Pick(object: any, keys: string[]) {
    return keys.reduce((obj: any, key: string) => {
        if (object && object.hasOwnProperty(key)) {
            obj[key] = object[key];
        }
        return obj;
    }, {});
}

export function Set(object: any, path: any, value: any) {
    if (Object(object) !== object) return object; // When object is not an object
    // If not yet an array, get the keys from the string-path
    if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
    path.slice(0, -1).reduce((a: any, c: any, i: number) => // Iterate all of them except the last one
            Object(a[c]) === a[c] // Does the key exist and is its value an object?
                // Yes: then follow that path
                ? a[c]
                // No: create the key. Is the next key a potential array-index?
                : a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1]
                ? [] // Yes: assign a new array object
                : {}, // No: assign a new plain object
        object)[path[path.length - 1]] = value; // Finally assign the value to the last key
    return object; // Return the top-level object to allow chaining
}

export function Get(obj: any, path: string, defaultValue: any) {
    const travel = (regexp: any) =>
        String.prototype.split
            .call(path, regexp)
            .filter(Boolean)
            .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
    return result === undefined || result === obj ? defaultValue : result;
}