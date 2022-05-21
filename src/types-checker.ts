/**
 * Check if a variable is type of the given types.
 * Throw an error if it is not.
 * @param option
 * @param type
 * @param name
 */
export function assertType<T>(option: T, type: string | string[], name = "Options"): true | never {
    if (typeof type === "string") {
        if (typeof option === type) return true;
        else if (type === "array" && Array.isArray(option)) return true;
    } else {
        const hasArrayInTypes = type.includes("array");

        if (!hasArrayInTypes && type.includes(typeof option)) {
            return true;
        } else if (hasArrayInTypes && (type.includes(typeof option) || Array.isArray(option))) {
            return true;
        }
    }

    throw new TypeError(`${name} must be typeof [${type}]`);
}

/**
 * Check if a variable is type of the given types.
 * @param variable
 * @param type
 */
export function isType<T>(variable: T, type: string | string[]): boolean {
    try {
        return assertType(variable, type);
    } catch (e) {
        return false;
    }
}
