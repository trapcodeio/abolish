import type { $skipRule, AbolishInlineValidator, AbolishRule } from "./types";
import type { AbolishRuleTyped } from "./functions";

/**
 * $inLine object generator
 * @param fn
 * @param $error
 */
export const $inline = (fn: AbolishInlineValidator, $error?: string) => {
    return $error ? { $inline: fn, $error } : { $inline: fn };
};

/**
 * $inLineAsync object generator
 */
export const $inlineAsync = (fn: AbolishInlineValidator, $error?: string) => {
    return $error ? { $inlineAsync: fn, $error } : { $inlineAsync: fn };
};

/**
 * Skip Rule Function Type
 * @param fn
 */
export function $skip<Val, Data>(fn: (val: Val, data: Data) => boolean) {
    return { $skip: fn as $skipRule };
}

/**
 * Skip if undefined
 * @param rule
 */
export function skipIfUndefined(rule: string | Record<string, any> | any[]) {
    if (!Array.isArray(rule)) rule = [rule];
    return [$skip((v) => v === undefined)].concat(rule as any);
}

/**
 * Skip if is undefined || null
 * @param rule
 */
export function skipIfNotDefined(rule: string | Record<string, any> | any[]) {
    if (!Array.isArray(rule)) rule = [rule];
    return [$skip((v) => v === undefined || v === null)].concat(rule as any);
}

/**
 * Optional - alias for skipIfNotDefined
 */
export const optional = skipIfNotDefined;

/**
 * Required helper function.
 * @example
 * required("string")
 * // is same as
 * ["required", "string"]
 */
export function required(rule: AbolishRule): AbolishRuleTyped {
    if (typeof rule === "string") {
        // add `required` to rule
        return "required|" + rule;
    } else if (Array.isArray(rule)) {
        // add `required` to rule
        return ["required", ...rule];
    } else if (typeof rule === "object") {
        // add `required` to rule
        return { required: true, ...rule };
    } else {
        throw new Error("Required: Invalid Rule");
    }
}

/**
 * Required helper function for typed rules.
 * @param rule
 * @example
 * requiredT("string")
 * // is same as
 * ["required", "string"]
 */
export function requiredT(rule: AbolishRuleTyped): AbolishRuleTyped {
    return required(rule);
}
