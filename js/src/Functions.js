"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const StringToRules_1 = __importDefault(require("./StringToRules"));
/**
 * Change to string to upperFirst
 * @param str
 * @constructor
 */
function UpperFirst(str) {
    return str[0].toUpperCase() + str.substr(1);
}
exports.UpperFirst = UpperFirst;
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
function Rule(rules) {
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
        if (typeof rule === "string")
            rule = StringToRules_1.default(rule);
        generatedRule = Object.assign(Object.assign({}, generatedRule), rule);
    }
    return generatedRule;
}
exports.Rule = Rule;
