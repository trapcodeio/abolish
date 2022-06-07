import StringToRules from "./StringToRules";
import { startCase, set, get } from "lodash";
import Abolish from "./Abolish";

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
 * Converts an array of rules (string | object)[] to one object rule
 * @example
 * const rule = Rule(['required', {min: 10, max: 20}, '!exact'])
 * // will return
 * { required: true, min: 10, max: 20, exact: false }
 *
 * @param rules
 * @constructor
 */
export function Rule(rules: string | any[]): any {
    /**
     * Convert to array if not array.
     */
    if (!Array.isArray(rules)) rules = [rules];

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
        if ((typeof rule as string) === "string") rule = StringToRules(rule);

        generatedRule = { ...generatedRule, ...rule };
    }

    return generatedRule;
}

export function abolish_Pick(obj: any, keys: string[]) {
    // Create new object
    const picked = {} as Record<any, any>;
    const hasDotKeys = keys.some(hasDotNotation);

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

/**
 * Abolish_Set
 * Because lodash is slow, we will only include it when there is a dot notation in the path.
 * @param obj
 * @param path
 * @param value
 */
export function abolish_Set(obj: any, path: any, value: any) {
    if (hasDotNotation(path)) {
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
 */
export function abolish_Get(obj: any, path: string) {
    if (hasDotNotation(path)) {
        return get(obj, path);
    } else {
        return obj[path];
    }
}

export function hasDotNotation(path: string) {
    return path.indexOf(".") !== -1;
}

export function ParseRules<Rules = Record<string, any>>(rules: Record<keyof Rules | string, any>) {
    /**
     * Stores generated rules
     */
    let generatedRule: any = {};

    /**
     * Loop Through each rule
     *
     * 1. convert to object if string
     * 2. add rule to generatedRule object
     */
    for (let key of Object.keys(rules)) {
        let rule = rules[key];

        /**
         * Exclude non rule related super keys e.g $include
         */
        if (key === "$include") {
            generatedRule[key] = rule;
        } else {
            if ((typeof rule as string) === "string") {
                rule = StringToRules(rule);
            } else if (Array.isArray(rule)) {
                rule = Rule(rule);
            }

            generatedRule[key] = rule;
        }
    }

    return generatedRule as Rules;
}
