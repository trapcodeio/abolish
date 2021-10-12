import AbolishError from "./AbolishError";
import ObjectModifier from "./ObjectModifier";

/**
 * ValidationError
 * @description
 * Result returned by the validate object
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
 * Result returned by the validate object
 */
export type ValidationResult<T = any> = [error: ValidationError | false, validated: T];

export type AbolishValidatorFunctionResult = boolean | AbolishError | void;

export type AbolishValidatorFunctionHelper = {
    error: (message: string, data?: any) => AbolishError;
    modifier: ObjectModifier;
};

export type AbolishValidatorFunction = (
    value: any,
    option: any,
    helpers: AbolishValidatorFunctionHelper
) => AbolishValidatorFunctionResult | Promise<AbolishValidatorFunctionResult>;

export type AbolishInlineValidator = (
    value: any,
    helpers: {
        error: (message: string, data?: any) => AbolishError;
        modifier: ObjectModifier;
    }
) => boolean | AbolishError | Promise<boolean | AbolishError>;

/**
 * Validator
 * @description
 * A new validator type
 */
export type AbolishValidator = {
    name: string;
    validator: AbolishValidatorFunction;
    error?: string;
    isAsync?: boolean;
};

export type AbolishRule = string | string[] | Record<string, any> | AbolishRule[];
