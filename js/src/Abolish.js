"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const StringToRules_1 = __importDefault(require("./StringToRules"));
const GlobalValidators_1 = __importDefault(require("./GlobalValidators"));
const Functions_1 = require("./Functions");
const AbolishError_1 = __importDefault(require("./AbolishError"));
const ObjectModifier_1 = __importDefault(require("./ObjectModifier"));
const pick_1 = __importDefault(require("lodash/pick"));
/**
 * Abolish Class
 * @class
 */
class Abolish {
    constructor() {
        this.validators = {};
    }
    /**
     * Add single global validator
     * @param validator
     */
    static addGlobalValidator(validator) {
        if (typeof validator === "object" && !Array.isArray(validator)) {
            // If no error defined set default error
            if (!validator.error)
                validator.error = `:param failed {${validator.name}} validation.`;
            // Add validator to instance validators
            GlobalValidators_1.default[validator.name] = validator;
        }
        else {
            throw new TypeError("addGlobalValidator argument must be an object.");
        }
    }
    /**
     * Add multiple global validators
     * @param validators
     */
    static addGlobalValidators(validators) {
        if (Array.isArray(validators)) {
            for (const value of validators) {
                Abolish.addGlobalValidator(value);
            }
        }
        else {
            throw new TypeError("addGlobalValidators argument must be an array");
        }
    }
    /**
     * addValidator
     * @description
     * Add validator or array of validators
     * @param validator
     */
    addValidator(validator) {
        if (typeof validator === "object" && !Array.isArray(validator)) {
            // If no error defined set default error
            if (!validator.error)
                validator.error = `:param failed {${validator.name}} validation.`;
            // Add validator to instance validators
            this.validators[validator.name] = validator;
        }
        else {
            throw new TypeError("addValidator argument must be an object.");
        }
        return this;
    }
    /**
     * addValidators
     * @description
     * Add validator or array of validators
     * @param validators
     */
    addValidators(validators) {
        if (Array.isArray(validators)) {
            for (const value of validators) {
                this.addValidator(value);
            }
        }
        else {
            throw new TypeError("addValidators argument must be an array");
        }
        return this;
    }
    /**
     * Validate
     * @description
     * Validates given object with rules defined on Abolish instance
     * @param {object} object
     * @param {object} rules
     */
    validate(object, rules) {
        /**
         * Check for wildcard rules (*, **)
         */
        let internalWildcardRules = {};
        if (rules.hasOwnProperty('*')) {
            internalWildcardRules = rules['*'];
            delete rules['*'];
            /**
             * Convert rules[*] to object if string
             * Using StringToRules function
             */
            if (typeof internalWildcardRules === "string")
                internalWildcardRules = StringToRules_1.default(internalWildcardRules);
        }
        /**
         * Validated clones original object to prevent modifying values in original object
         */
        let validated = Object.assign({}, object);
        /**
         * Get Keys to be validated
         */
        const keysToBeValidated = Object.keys(rules);
        // Loop through defined rules
        for (const rule of keysToBeValidated) {
            let ruleData = rules[rule];
            /**
             * If ruleData is wildcard change rule data to empty object
             */
            if (ruleData === '*')
                ruleData = {};
            /**
             * Convert ruleData to object if string
             * Using StringToRules function
             */
            if (typeof ruleData === "string")
                ruleData = StringToRules_1.default(ruleData);
            /**
             * Append internal Wildcard data
             */
            ruleData = Object.assign(Object.assign({}, internalWildcardRules), ruleData);
            /**
             * Loop through ruleData to check if validators defined exists
             */
            for (const validatorName of Object.keys(ruleData)) {
                /**
                 * Throw Error if validator is not defined in global or local validators
                 */
                if (!this.validators.hasOwnProperty(validatorName) && !GlobalValidators_1.default.hasOwnProperty(validatorName)) {
                    throw new Error(`Validator: {${validatorName}} does not exists but defined in rules`);
                }
                /**
                 * The value of the validator set in rules
                 * e.g {must: true}
                 * where "true" is validationOption
                 */
                const validatorOption = ruleData[validatorName];
                /**
                 * Value of key being validated in object
                 */
                const objectValue = object[rule];
                /**
                 * Validator of rule defined in rules.
                 */
                const validator = (this.validators[validatorName] || GlobalValidators_1.default[validatorName]);
                /**
                 * Try running
                 */
                let validationResult = false;
                try {
                    /**
                     * Run Validation
                     * Passing required helpers
                     */
                    validationResult = validator.validator(objectValue, validatorOption, {
                        error: (message, data) => new AbolishError_1.default(message, data),
                        modifier: new ObjectModifier_1.default(validated, rule)
                    });
                }
                catch (e) {
                    /**
                     * If error when running defined function
                     * Send error as validationResult with type as 'internal'
                     */
                    return {
                        error: {
                            key: rule,
                            type: 'internal',
                            validator: validatorName,
                            message: e.message,
                            data: e.stack
                        }
                    };
                }
                if (validationResult instanceof AbolishError_1.default) {
                    return {
                        error: {
                            key: rule,
                            type: 'validator',
                            validator: validatorName,
                            message: validationResult.message,
                            data: validationResult.data
                        }
                    };
                }
                else if (!validationResult) {
                    /**
                     * Check if option is stringable
                     * This is required because a rule option could an array or an object
                     * and these cannot be converted to string
                     *
                     * Only strings and numbers can be parsed as :option
                     */
                    const optionIsStringable = typeof validatorOption === "string" || typeof validatorOption === "number";
                    /**
                     * Replace :param with rule converted to upperCase
                     * and if option is stringable, replace :option with validatorOption
                     */
                    let message = validator.error.replace(':param', Functions_1.upperFirst(rule));
                    if (optionIsStringable)
                        message = message.replace(':option', validatorOption);
                    // Return Error using the ValidationResult format
                    return {
                        error: {
                            key: rule,
                            type: 'validator',
                            validator: validatorName,
                            message,
                            data: null
                        }
                    };
                }
            }
        }
        // Pick only keys in rules
        validated = pick_1.default(validated, keysToBeValidated);
        return {
            error: null,
            validated
        };
    }
}
module.exports = Abolish;
