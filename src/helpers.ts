import type { $skipRule, AbolishInlineValidator } from "./types";

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
