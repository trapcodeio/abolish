import AbolishError from "./AbolishError";
import ObjectModifier from "./ObjectModifier";

/**
 * ValidationResult
 * @description
 * Result returned by the validate object
 */
export type ValidationResult = {
    error: null | {
        key: string
        type: 'internal' | 'validator'
        message: string
        validator: string
        data: any
    },
    validated?: object
}

export type ValidatorFunction = (
    value: any,
    option: any,
    helpers: {
        error: (message: string, data?: any) => AbolishError,
        modifier: ObjectModifier
    }
) => boolean | AbolishError

/**
 * Validator
 * @description
 * A new validator type
 */
export type Validator = {
    name: string,
    validator: ValidatorFunction,
    error?: string,
    isAsync?: boolean
}

/**
 * Default javascript object
 */
export type ObjectType = { [key: string]: any }