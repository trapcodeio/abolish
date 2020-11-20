import AbolishError from "./AbolishError";
import ObjectModifier from "./ObjectModifier";
/**
 * ValidationError
 * @description
 * Result returned by the validate object
 */
export declare type ValidationError = {
    key: string;
    type: 'internal' | 'validator';
    message: string;
    validator: string;
    data: any;
};
/**
 * ValidationResult
 * @description
 * Result returned by the validate object
 */
export declare type ValidationResult = {
    error: ValidationError | false;
    validated?: any;
};
export declare type AbolishValidatorFunction = (value: any, option: any, helpers: {
    error: (message: string, data?: any) => AbolishError;
    modifier: ObjectModifier;
}) => boolean | AbolishError | Promise<boolean | AbolishError>;
export declare type AbolishInlineValidator = (value: any, helpers: {
    error: (message: string, data?: any) => AbolishError;
    modifier: ObjectModifier;
}) => boolean | AbolishError | Promise<boolean | AbolishError>;
/**
 * Validator
 * @description
 * A new validator type
 */
export declare type AbolishValidator = {
    name: string;
    validator: AbolishValidatorFunction;
    error?: string;
    isAsync?: boolean;
};
