import { Validator, ValidationResult, ObjectType } from "./Types";
/**
 * Abolish Class
 * @class
 */
declare class Abolish {
    validators: {
        [key: string]: Validator;
    };
    /**
     * Add single global validator
     * @param validator
     */
    static addGlobalValidator(validator: Validator): void;
    /**
     * Add multiple global validators
     * @param validators
     */
    static addGlobalValidators(validators: Validator[]): void;
    /**
     * addValidator
     * @description
     * Add validator or array of validators
     * @param validator
     */
    addValidator(validator: Validator): this;
    /**
     * addValidators
     * @description
     * Add validator or array of validators
     * @param validators
     */
    addValidators(validators: Validator[]): this;
    /**
     * Validate
     * @description
     * Validates given object with rules defined on Abolish instance
     * @param {object} object
     * @param {object} rules
     */
    static validate(object: ObjectType, rules: ObjectType): ValidationResult;
    /**
     * Validate Async
     *
     * Waits for all validation defined
     * @param object
     * @param rules
     * @return {Promise<ValidationResult>}
     */
    static validateAsync(object: ObjectType, rules: ObjectType): Promise<ValidationResult>;
    /**
     * Validate
     * @description
     * Validates given object with rules defined on Abolish instance
     * @param {object} object
     * @param {object} rules
     * @param {boolean} isAsync
     */
    validate(object: ObjectType, rules: ObjectType, isAsync?: boolean): ValidationResult;
    /**
     * Validate Async
     *
     * Waits for all validation defined
     * @param object
     * @param rules
     * @return {Promise<ValidationResult>}
     */
    validateAsync(object: ObjectType, rules: ObjectType): Promise<ValidationResult>;
}
export = Abolish;
