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