import { AbolishInlineValidator } from "./types";

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
 * Skip if undefined
 * @param rule
 */
export function skipIfUndefined(rule: string | any[]) {
    if (!Array.isArray(rule)) rule = [rule];
    return [{ $skip: (v: any) => v === undefined }].concat(rule as any);
}

/**
 * Skip if is undefined || null
 * @param rule
 */
export function skipIfNotDefined(rule: string | any[]) {
    if (!Array.isArray(rule)) rule = [rule];
    return [{ $skip: (v: any) => v === undefined || v === null }].concat(rule as any);
}
