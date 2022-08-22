import { startCase, set, get } from "lodash";
import type Abolish from "./Abolish";

/**
 * Change to string to upperFirst
 * @param str
 * @constructor
 */
export function abolish_UpperFirst(str: string): string {
    return str[0].toUpperCase() + str.substring(1);
}

/**
 * abolish_StartCase
 * @param str
 * @param abolishInstance
 * @constructor
 */
export function abolish_StartCase(str: string, abolishInstance?: Abolish): string {
    return abolishInstance
        ? abolishInstance.config.useStartCaseInErrors
            ? startCase(str)
            : str
        : startCase(str);
}

/**
 * Pick keys from object
 * @param obj
 * @param keys
 * @param $hasDotFields
 */
export function abolish_Pick(obj: any, keys: string[], $hasDotFields?: boolean) {
    // Create new object
    const picked = {} as Record<any, any>;
    const hasDotKeys = $hasDotFields === undefined ? keys.some(hasDotNotation) : $hasDotFields;

    // Loop through props and push to new object
    if (hasDotKeys) {
        for (let prop of keys) {
            picked[prop] = abolish_Get(obj, prop);
        }
    } else {
        for (let prop of keys) {
            picked[prop] = obj[prop];
        }
    }

    // Return new object
    return picked;
}

export function abolish_Omit(obj: Record<string, any>, keys: string[]) {
    // Create new object
    const picked = {} as Record<string, any>;

    // Loop through props and push to new object
    for (let prop in obj) {
        if (keys.includes(prop)) continue;
        picked[prop] = obj[prop];
    }

    // Return new object
    return picked;
}

/**
 * Abolish_Set
 * Because lodash is slow, we will only include it when there is a dot notation in the path.
 * @param obj
 * @param path
 * @param value
 * @param $hasDotNotation
 */
export function abolish_Set(obj: any, path: any, value: any, $hasDotNotation?: boolean) {
    if ($hasDotNotation === undefined && hasDotNotation(path)) {
        return set(obj, path, value);
    } else {
        obj[path] = value;
        return obj;
    }
}

/**
 * Abolish_Get
 * Because lodash is slow, we will only include it when there is a dot notation in the path.
 * @param obj
 * @param path
 * @param $hasDotNotation
 */
export function abolish_Get(obj: any, path: string, $hasDotNotation?: boolean) {
    if ($hasDotNotation === undefined && hasDotNotation(path)) {
        return get(obj, path);
    } else {
        return obj[path];
    }
}

/**
 * Check if a string has a dot notation
 * @param path
 */
export function hasDotNotation(path: string) {
    return path.indexOf(".") !== -1;
}

/**
 * Instanceof
 * After running some tests with instanceof, we decided to use this instead.
 */

export function InstanceOf(type: Function, obj: any) {
    return typeof obj === "object" && obj instanceof type;
}
