/**
 * Change to string to upperFirst
 * @param str
 * @constructor
 */
export declare function UpperFirst(str: string): string;
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
export declare function Rule(rules: any[]): any;
export declare function Pick(object: any, keys: string[]): any;
export declare function Set(object: any, path: any, value: any): any;
export declare function Get(obj: any, path: string, defaultValue: any): any;
