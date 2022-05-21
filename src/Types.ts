import type Abolish from "./Abolish";
import type AbolishError from "./AbolishError";
import type ObjectModifier from "./ObjectModifier";

/**
 * ValidationError
 * @description
 * Result returned by to validate object
 */
export type ValidationError = {
    key: string;
    type: "internal" | "validator";
    message: string;
    validator: string;
    data: any;
};

/**
 * ValidationResult
 * @description
 * Result returned by to validate object
 */
export type ValidationResult<T = any> = [error: ValidationError | false, validated: T];

export type AbolishValidatorFunctionResult = boolean | AbolishError | void;

export type AbolishValidatorFunctionHelper = {
    error: (message: string, data?: any) => AbolishError;
    modifier: ObjectModifier;
    abolish: Abolish;
};

export type AbolishValidatorFunction = (
    value: any,
    option: any,
    helpers: AbolishValidatorFunctionHelper
) => AbolishValidatorFunctionResult | Promise<AbolishValidatorFunctionResult>;

export type AbolishInlineValidator = (
    value: any,
    helpers: AbolishValidatorFunctionHelper
) => boolean | AbolishError | Promise<boolean | AbolishError>;

/**
 * Validator
 * @description
 * A new validator type
 */
export interface AbolishValidator {
    name: string;
    description?: string;
    validator: AbolishValidatorFunction;
    error?: string;
    isAsync?: true;
}

export interface AbolishAsyncValidator extends Omit<AbolishValidator, "isAsync"> {
    isAsync: true;
}

export type AbolishRule = string | string[] | Record<string, any> | AbolishRule[];
