import {Validator, ValidationResult, ObjectType} from "./Types"
import StringToRules from "./StringToRules";
import GlobalValidators from "./GlobalValidators";
import {StartCase, Pick} from "./Functions";
import AbolishError from "./AbolishError";
import ObjectModifier from "./ObjectModifier";

/**
 * Abolish Class
 * @class
 */
class Abolish {

    validators: {
        [key: string]: Validator
    } = {};

    /**
     * Add single global validator
     * @param validator
     */
    static addGlobalValidator(validator: Validator) {
        if (typeof validator === "object" && !Array.isArray(validator)) {

            // If no error defined set default error
            if (!validator.error) validator.error = `:param failed {${validator.name}} validation.`;

            // Add validator to instance validators
            GlobalValidators[validator.name] = validator;

        } else {
            throw new TypeError("addGlobalValidator argument must be an object.");
        }
    }

    /**
     * Add multiple global validators
     * @param validators
     */
    static addGlobalValidators(validators: Validator[]) {
        if (Array.isArray(validators)) {
            for (const value of validators) {
                Abolish.addGlobalValidator(value)
            }
        } else {
            throw new TypeError("addGlobalValidators argument must be an array")
        }
    }

    /**
     * addValidator
     * @description
     * Add validator or array of validators
     * @param validator
     */
    addValidator(validator: Validator): this {

        if (typeof validator === "object" && !Array.isArray(validator)) {

            // If no error defined set default error
            if (!validator.error) validator.error = `:param failed {${validator.name}} validation.`;

            // Add validator to instance validators
            this.validators[validator.name] = validator;

        } else {
            throw new TypeError("addValidator argument must be an object.");
        }

        return this
    }

    /**
     * addValidators
     * @description
     * Add validator or array of validators
     * @param validators
     */
    addValidators(validators: Validator[]): this {
        if (Array.isArray(validators)) {
            for (const value of validators) {
                this.addValidator(value)
            }
        } else {
            throw new TypeError("addValidators argument must be an array")
        }

        return this
    }

    /**
     * Validate
     * @description
     * Validates given object with rules defined on Abolish instance
     * @param {object} object
     * @param {object} rules
     */
    static validate(object: ObjectType, rules: ObjectType): ValidationResult {
        return (new this).validate(object, rules);
    }

    /**
     * Validate Async
     *
     * Waits for all validation defined
     * @param object
     * @param rules
     * @return {Promise<ValidationResult>}
     */
    static validateAsync(object: ObjectType, rules: ObjectType): Promise<ValidationResult> {
        return (new this).validateAsync(object, rules)
    }

    /**
     * Validate
     * @description
     * Validates given object with rules defined on Abolish instance
     * @param {object} object
     * @param {object} rules
     * @param {boolean} isAsync
     */
    validate(object: ObjectType, rules: ObjectType, isAsync = false): ValidationResult {

        let asyncData = {
            validated: {} as any,
            jobs: [] as any
        };

        /**
         * Check for wildcard rules (*, **)
         */
        let internalWildcardRules: any = {};
        if (rules.hasOwnProperty('*')) {
            internalWildcardRules = rules['*'];
            delete rules['*'];

            /**
             * Convert rules[*] to object if string
             * Using StringToRules function
             */
            if (typeof internalWildcardRules === "string")
                internalWildcardRules = StringToRules(internalWildcardRules);
        }

        /**
         * Validated clones original object to prevent modifying values in original object
         */
        let validated: ObjectType = {...object};

        /**
         * Get Keys to be validated
         */
        const keysToBeValidated = Object.keys(rules);


        // Loop through defined rules
        for (const rule of keysToBeValidated) {

            let ruleData: any = rules[rule];

            /**
             * If ruleData is wildcard change rule data to empty object
             */
            if (ruleData === '*') ruleData = {};

            /**
             * Convert ruleData to object if string
             * Using StringToRules function
             */
            if (typeof ruleData === "string")
                ruleData = StringToRules(ruleData);

            /**
             * if ruleData has property of $skip then check
             */
            let $skip: any = false;

            if (ruleData.hasOwnProperty('$skip')) {
                $skip = ruleData['$skip'];
                delete ruleData['$skip'];

                if (typeof $skip === 'function') {
                    $skip = $skip(validated[rule])
                }

                if (typeof $skip !== 'boolean') {
                    throw new Error(`$skip value or resolved function value must be a BOOLEAN in RuleFor: (${rule})`);
                }
            }

            /**
             * Run validation if not $skip
             */
            if (!$skip) {

                /**
                 * if ruleData has property of $name then set to name
                 */
                let $name: string | false = false;
                if (ruleData.hasOwnProperty('$name')) {
                    $name = ruleData['$name'];
                    delete ruleData['$name'];

                    if (typeof $name !== 'string') {
                        throw new Error(`$skip value or resolved function value must be a BOOLEAN in RuleFor: (${rule})`);
                    }
                }

                /**
                 * check if rules has custom error: $error
                 */
                let $error: any = false;
                if (ruleData.hasOwnProperty('$error')) {
                    $error = ruleData['$error'];
                    delete ruleData['$error'];

                    if (!$error || typeof $error !== 'string') {
                        throw new Error(`$error value must be a STRING in RuleFor: (${rule})`);
                    }
                }

                /**
                 * Append internal Wildcard data
                 */
                ruleData = {...internalWildcardRules, ...ruleData};


                /**
                 * Loop through ruleData to check if validators defined exists
                 */
                for (const validatorName of Object.keys(ruleData)) {

                    /**
                     * Throw Error if validator is not defined in global or local validators
                     */
                    if (!this.validators.hasOwnProperty(validatorName) && !GlobalValidators.hasOwnProperty(validatorName)) {
                        throw new Error(`Validator: {${validatorName}} does not exists but defined in rules`)
                    }

                    /**
                     * Validator of rule defined in rules.
                     */
                    const validator = (this.validators[validatorName] || GlobalValidators[validatorName]) as Validator;

                    if (!isAsync && validator.isAsync) {
                        throw new Error(`Validator: {${validatorName}} is async, use validateAsync method instead.`)
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
                    const objectValue = validated[rule];

                    /**
                     * If is async push needed data to asyncData
                     */
                    if (isAsync) {
                        asyncData.jobs.push({$name, rule, validator, validatorName, validatorOption, $error})
                    } else {
                        /**
                         * Try running validator
                         */
                        let validationResult: any = false;
                        try {
                            /**
                             * Run Validation
                             * Passing required helpers
                             */
                            validationResult = validator.validator(objectValue, validatorOption, {
                                error: (message: string, data?: any) => new AbolishError(message, data),
                                modifier: new ObjectModifier(validated, rule)
                            });

                        } catch (e) {
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
                            }
                        }


                        if (validationResult instanceof AbolishError) {
                            return {
                                error: {
                                    key: rule,
                                    type: 'validator',
                                    validator: validatorName,
                                    message: $error ? $error : validationResult.message,
                                    data: validationResult.data
                                }
                            }
                        } else if (validationResult === false) {
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
                            let message = ($error ? $error : validator.error!).replace(':param', $name ? $name : StartCase(rule));
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
                            }
                        }
                    }
                }
            }
        }

        if (isAsync) {
            asyncData.validated = validated;
            return asyncData as any;
        }

        // Pick only keys in rules
        validated = Pick(validated, keysToBeValidated);

        return {
            error: false,
            validated
        }
    }

    /**
     * Validate Async
     *
     * Waits for all validation defined
     * @param object
     * @param rules
     * @return {Promise<ValidationResult>}
     */
    validateAsync(object: ObjectType, rules: ObjectType): Promise<ValidationResult> {
        /**
         * Get asyncData
         */
        const asyncData: any = this.validate(object, rules, true);

        /**
         * Destruct values in async data
         */
        const {validated, jobs} = asyncData;

        /**
         * Get Keys to be validated
         */
        const keysToBeValidated = Object.keys(rules);

        /**
         * Return a promise
         */
        return new Promise<ValidationResult>(async (resolve) => {

            /**
             * Loop through jobs and run their validators
             */
            for (const job of jobs) {
                const {$name, rule, validator, validatorName, validatorOption, $error} = job;

                /**
                 * Value of key being validated in object
                 */
                const objectValue = validated[rule];

                let validationResult: any = false;
                try {
                    /**
                     * Run Validation
                     * Passing required helpers
                     */
                    validationResult = await validator.validator(objectValue, validatorOption, {
                        error: (message: string, data?: any) => new AbolishError(message, data),
                        modifier: new ObjectModifier(validated, rule)
                    });

                } catch (e) {
                    /**
                     * If error when running defined function
                     * Send error as validationResult with type as 'internal'
                     */
                    return resolve({
                        error: {
                            key: rule,
                            type: 'internal',
                            validator: validatorName,
                            message: e.message,
                            data: e.stack
                        }
                    })
                }


                if (validationResult instanceof AbolishError) {
                    return resolve({
                        error: {
                            key: rule,
                            type: 'validator',
                            validator: validatorName,
                            message: $error ? $error : validationResult.message,
                            data: validationResult.data
                        }
                    })
                } else if (validationResult === false) {
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
                    let message = ($error ? $error : validator.error!).replace(':param', $name ? $name : StartCase(rule));
                    if (optionIsStringable)
                        message = message.replace(':option', validatorOption);

                    // Return Error using the ValidationResult format
                    return resolve({
                        error: {
                            key: rule,
                            type: 'validator',
                            validator: validatorName,
                            message,
                            data: null
                        }
                    })
                }
            }

            return resolve({
                error: false,
                validated: Pick(validated, keysToBeValidated)
            })
        });
    }
}

export = Abolish;