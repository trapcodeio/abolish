import type Abolish from "./Abolish";
import type AbolishError from "./AbolishError";
import type ObjectModifier from "./ObjectModifier";

/**
 * ValidationError
 * @description
 * Result returned by to validate object
 */
export type ValidationError = {
    code: string;
    key: string;
    type: "internal" | "validator";
    message: string;
    validator: string;
    data: any;
};

export type $skipRule = boolean | ((value: any, data: Record<any, any>) => boolean);

export type $errorRule =
    | string
    | ((e: Pick<ValidationError, "code" | "data" | "validator"> & { value: any }) => string);

export type $errorsRule = Record<string, $errorRule>;

/**
 * ValidationResult
 * @description
 * Result returned by to validate object
 */
export type ValidationResult<T = any> = [error: ValidationError | undefined, validated: T];

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
    description?: string | string[];
    validator: AbolishValidatorFunction;
    error?: string;
    isAsync?: true;
}

export interface AbolishAsyncValidator extends Omit<AbolishValidator, "isAsync"> {
    isAsync: true;
}

export type AbolishRule = string | string[] | Record<string, any> | AbolishRule[];
// export type AbolishSchema<Keys extends string | number | symbol = string> = Record<
//     Keys,
//     AbolishRule
// >;
export type AbolishSchema<Keys extends Record<string, any> = Record<string, any>> = Record<
    keyof Keys | string,
    AbolishRule
>;
