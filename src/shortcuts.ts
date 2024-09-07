/**
 * Note:
 * Only functions related to Abolish Should be added here.
 */
import { AbolishSchema } from "./types";
import { Abolish } from "../index";
import { AbolishSchemaTyped } from "./functions";

/**
 * Compile a schema object.
 * @param schema
 * @param abolish
 */
export function compileSchema(schema: AbolishSchema, abolish?: typeof Abolish) {
    if (!abolish) abolish = Abolish;
    return abolish.compileObject(schema);
}

/**
 * Compile a rule object.
 * @param rule
 * @param abolish
 */
export function compileRule(rule: any, abolish?: typeof Abolish) {
    if (!abolish) abolish = Abolish;
    return abolish.compile(rule);
}

/**
 * Compile a schema object typed.
 * @param schema
 * @param abolish
 */
export function compileSchemaT(schema: AbolishSchemaTyped, abolish?: typeof Abolish) {
    return compileSchema(schema, abolish);
}

/**
 * Compile a rule object typed.
 * @param rule
 * @param abolish
 */
export function compileRuleT(rule: any, abolish?: typeof Abolish) {
    return compileRule(rule, abolish);
}
