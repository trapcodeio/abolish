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
export declare type ValidatorFunction = (value: any, option: any, helpers: {
    error: (message: string, data?: any) => AbolishError;
    modifier: ObjectModifier;
}) => boolean | AbolishError | Promise<boolean | AbolishError>;
/**
 * Validator
 * @description
 * A new validator type
 */
export declare type Validator = {
    name: string;
    validator: ValidatorFunction;
    error?: string;
    isAsync?: boolean;
};
/**
 * Default javascript object
 */
export declare type ObjectType = {
    [key: string]: any;
};
