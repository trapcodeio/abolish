import StringToRules from "./StringToRules";
import type { AbolishRule, AbolishSchema } from "./types";
import type { AV } from "./validator";

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
export function Rule(rules: AbolishRule): any {
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
    for (let rule of rules as AbolishRule[]) {
        if (typeof rule === "string") rule = StringToRules(rule);
        generatedRule = { ...generatedRule, ...rule };
    }

    return generatedRule;
}

export type AbolishRuleTyped = string | AV | Array<string | AV>;
export type AbolishSchemaTyped = Record<string, AbolishRuleTyped>;

/**
 * Typed version of Rule
 * @param rule
 * @constructor
 */
export function RuleTyped(rule: AbolishRuleTyped) {
    return Rule(rule);
}

/**
 * Parse object value  as rule
 * @param rules
 * @constructor
 */
export function Schema(rules: AbolishSchema) {
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
                rule = StringToRules(rule as string);
            } else if (Array.isArray(rule)) {
                rule = Rule(rule);
            }

            generatedRule[key] = rule;
        }
    }

    return generatedRule as AbolishSchema;
}

/**
 * Parse object value as rule
 * @param rules
 * @constructor
 */
export function SchemaTyped(rules: AbolishSchemaTyped) {
    return Schema(rules as any) as AbolishSchemaTyped;
}
