import { AbolishValidator, ValidationResult } from "./Types";
/**
 * Abolish Class
 * @class
 */
declare class Abolish {
    validators: {
        [key: string]: AbolishValidator;
    };
    /**
     * Add single global validator
     * @param validator
     */
    static addGlobalValidator(validator: AbolishValidator): void;
    /**
     * Add multiple global validators
     * @param validators
     */
    static addGlobalValidators(validators: AbolishValidator[]): void;
    /**
     * addValidator
     * @description
     * Add validator or array of validators
     * @param validator
     */
    addValidator(validator: AbolishValidator): this;
    /**
     * addValidators
     * @description
     * Add validator or array of validators
     * @param validators
     */
    addValidators(validators: AbolishValidator[]): this;
    /**
     * Validate
     * @description
     * Validates given object with rules defined on Abolish instance
     * @param {object} object
     * @param {object} rules
     */
    static validate(object: Record<string, any>, rules: Record<string, any>): ValidationResult;
    /**
     * Validate Async
     *
     * Waits for all validation defined
     * @param object
     * @param rules
     * @return {Promise<ValidationResult>}
     */
    static validateAsync(object: Record<string, any>, rules: Record<string, any>): Promise<ValidationResult>;
    /**
     * Validate
     * @description
     * Validates given object with rules defined on Abolish instance
     * @param {object} object
     * @param {object} rules
     * @param {boolean} isAsync
     */
    validate(object: Record<string, any>, rules: Record<string, any>, isAsync?: boolean): ValidationResult;
    /**
     * Validate Async
     *
     * Waits for all validation defined
     * @param object
     * @param rules
     * @return {Promise<ValidationResult>}
     */
    validateAsync(object: Record<string, any>, rules: Record<string, any>): Promise<ValidationResult>;
}
export = Abolish;
