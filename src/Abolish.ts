import type { AbolishRule, AbolishValidator, ValidationError, ValidationResult } from "./Types";
import StringToRules from "./StringToRules";
import GlobalValidators from "./GlobalValidators";
import { abolish_Get, abolish_Pick, abolish_StartCase, Rule } from "./Functions";
import AbolishError from "./AbolishError";
import ObjectModifier from "./ObjectModifier";
import { cloneDeep } from "lodash";

type Job = {
    $name: string | false;
    rule: string;
    validator: AbolishValidator;
    validatorName: string;
    validatorOption: any;
    $error: string | undefined;
    $errors: Record<string, string> | undefined;
};

type AsyncData = {
    validated: Record<string, any>;
    jobs: Job[];
    keysToBeValidated: string[];
    includeKeys: string[];
};

class AttemptError extends Error {
    public error: ValidationError;

    constructor(e: ValidationError) {
        super(e.message);
        this.name = "AttemptError";
        this.error = e;
    }
}

/**
 * Abolish Class
 * @class
 */
class Abolish {
    validators: {
        [key: string]: AbolishValidator;
    } = {};

    config: { useStartCaseInErrors: boolean } = { useStartCaseInErrors: true };

    /**
     * Get global validators
     */
    static getGlobalValidators() {
        return GlobalValidators;
    }

    /**
     * Get global validators list
     */
    static getGlobalValidatorsList() {
        return Object.keys(this.getGlobalValidators());
    }

    /**
     * Add single global validator
     * @param validator
     */
    static addGlobalValidator(validator: AbolishValidator) {
        if (typeof validator === "object" && !Array.isArray(validator)) {
            // If no error defined set default error
            if (!validator.error) validator.error = `:param failed {${validator.name}} validation.`;

            // Add validator to instance validators
            GlobalValidators[validator.name] = validator;
        } else {
            throw new TypeError("addGlobalValidator argument must be an object.");
        }

        return this;
    }

    /**
     * Add multiple global validators
     * @param validators
     */
    static addGlobalValidators(validators: AbolishValidator[] | Record<string, AbolishValidator>) {
        if (typeof validators === "object") {
            validators = Object.values(validators);
        }

        if (Array.isArray(validators)) {
            for (const value of validators) {
                Abolish.addGlobalValidator(value);
            }
        } else {
            throw new TypeError("addGlobalValidators argument must be an array or an object");
        }

        return this;
    }

    /**
     * Toggle start case in error.
     * @param value
     */
    useStartCaseInErrors(value: boolean = true) {
        this.config.useStartCaseInErrors = value;
        return this;
    }

    /**
     * addValidator
     * @description
     * Add validator or array of validators
     * @param validator
     */
    addValidator(validator: AbolishValidator): this {
        if (typeof validator === "object" && !Array.isArray(validator)) {
            // If no error defined set default error
            if (!validator.error) validator.error = `:param failed {${validator.name}} validation.`;

            // Add validator to instance validators
            this.validators[validator.name] = validator;
        } else {
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
    addValidators(validators: AbolishValidator[] | Record<string, AbolishValidator>): this {
        if (typeof validators === "object") {
            validators = Object.values(validators);
        }

        if (Array.isArray(validators)) {
            for (const value of validators) {
                this.addValidator(value);
            }
        } else {
            throw new TypeError("addValidators argument must be an array or an object");
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
    static validate<R = Record<string, any> | any>(
        object: Record<string, any>,
        rules: Record<keyof R | string, any>
    ): ValidationResult<R> {
        return new this().validate(object, rules);
    }

    /**
     * Validate Async
     *
     * Waits for all validation defined
     * @param object
     * @param rules
     * @return {Promise<ValidationResult>}
     */
    static validateAsync<R = Record<string, any>>(
        object: Record<string, any>,
        rules: Record<keyof R | string, any>
    ): Promise<ValidationResult<R>> {
        return new this().validateAsync(object, rules);
    }

    /**
     * Validate
     * @description
     * Validates given object with rules defined on Abolish instance
     * @param {object} object
     * @param {object} rules
     * @param {boolean} isAsync
     */
    validate<R = Record<string, any>>(
        object: Record<string, any>,
        rules: Record<keyof R | string, any>,
        isAsync = false
    ): ValidationResult<R> {
        let asyncData: AsyncData = {
            validated: {},
            jobs: [],
            keysToBeValidated: [],
            includeKeys: []
        };

        // clone rules
        rules = cloneDeep(rules);

        /**
         * Check for wildcard rules (*, $)
         */
        let internalWildcardRules: any = {};
        if (rules.hasOwnProperty("*") || rules.hasOwnProperty("$")) {
            internalWildcardRules = rules["*"] || rules["$"];

            delete rules["*"];
            delete rules["$"];

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
        let validated: Record<string, any> = { ...object };

        /**
         * Get Keys to be validated
         */
        let includeKeys: string[] = [];
        if (rules.hasOwnProperty("$include")) {
            includeKeys = rules["$include"];

            if (!Array.isArray(includeKeys)) throw new Error(`$include has to be an array!`);

            delete rules["$include"];
        }

        let keysToBeValidated = Object.keys(rules);

        // Loop through defined rules
        for (const rule of keysToBeValidated) {
            let ruleData: any = rules[rule];

            /**
             * If ruleData is wildcard change rule data to empty object
             */
            if (["*", "$"].includes(ruleData)) ruleData = {};

            /**
             * Convert ruleData to object if string
             * Using StringToRules function
             */
            if (typeof ruleData === "string") {
                ruleData = StringToRules(ruleData);
            } else if (Array.isArray(ruleData)) {
                ruleData = Rule(ruleData);
            }

            /**
             * if ruleData has property of $skip then check
             */
            let $skip: any = false;

            if (ruleData.hasOwnProperty("$skip")) {
                $skip = ruleData["$skip"];
                delete ruleData["$skip"];

                if (typeof $skip === "function") {
                    $skip = $skip(validated[rule]);
                }

                if (typeof $skip !== "boolean") {
                    throw new Error(
                        `$skip value or resolved function value must be a BOOLEAN in RuleFor: (${rule})`
                    );
                }
            }

            /**
             * Run validation if not $skip
             */
            if ($skip) {
                keysToBeValidated = keysToBeValidated.filter((v) => v !== rule);
            } else {
                /**
                 * if ruleData has property of $name then set to name
                 */
                let $name: string | false = false;
                if (ruleData.hasOwnProperty("$name")) {
                    $name = ruleData["$name"];
                    delete ruleData["$name"];

                    if (typeof $name !== "string") {
                        throw new Error(`$name must be a string in RuleFor: (${rule})`);
                    }
                }

                /**
                 * check if rules has custom error: $error
                 */
                let $error: string | undefined;
                if (ruleData.hasOwnProperty("$error")) {
                    $error = ruleData["$error"];
                    delete ruleData["$error"];

                    // noinspection SuspiciousTypeOfGuard
                    if (!$error || typeof $error !== "string") {
                        throw new Error(`$error value must be a STRING in RuleFor: (${rule})`);
                    }
                }

                let $errors: Record<string, string> | undefined;
                if (ruleData.hasOwnProperty("$errors")) {
                    $errors = ruleData["$errors"];
                    delete ruleData["$errors"];

                    // noinspection SuspiciousTypeOfGuard
                    if (!$errors || typeof $errors !== "object") {
                        throw new Error(`$errors value must be an OBJECT in RuleFor: (${rule})`);
                    }
                }

                /**
                 * Append internal Wildcard data
                 */
                ruleData = { ...internalWildcardRules, ...ruleData };

                /**
                 * Loop through ruleData to check if validators defined exists
                 */
                for (const validatorName of Object.keys(ruleData)) {
                    /**
                     * Throw Error if validator is not defined in global or local validators
                     */
                    if (
                        !this.validators.hasOwnProperty(validatorName) &&
                        !GlobalValidators.hasOwnProperty(validatorName)
                    ) {
                        throw new Error(
                            `Validator: {${validatorName}} does not exists but defined in rules`
                        );
                    }

                    /**
                     * Validator of rule defined in rules.
                     */
                    const validator = (this.validators[validatorName] ||
                        GlobalValidators[validatorName]) as AbolishValidator;

                    if (!isAsync && validator.isAsync) {
                        throw new Error(
                            `Validator: {${validatorName}} is async, use async method instead.`
                        );
                    }

                    /**
                     * The value of the validator set in rules
                     * e.g {required: true}
                     * where "true" is validationOption
                     */
                    const validatorOption = ruleData[validatorName];

                    /**
                     * Value of key being validated in object
                     */
                    const objectValue = abolish_Get(validated, rule);

                    /**
                     * If is async push needed data to asyncData
                     */
                    if (isAsync) {
                        asyncData.jobs.push({
                            $name,
                            rule,
                            validator,
                            validatorName,
                            validatorOption,
                            $error,
                            $errors
                        });
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
                                error: (message: string, data?: any) =>
                                    new AbolishError(message, data),
                                modifier: new ObjectModifier(validated, rule, $name),
                                abolish: this
                            });
                        } catch (e: any) {
                            /**
                             * If error when running defined function
                             * Send error as validationResult with type as 'internal'
                             */
                            return [
                                {
                                    key: rule,
                                    type: "internal",
                                    validator: validatorName,
                                    message: e.message,
                                    data: e.stack
                                },
                                {} as R
                            ];
                        }

                        if (
                            validationResult === false ||
                            validationResult instanceof AbolishError
                        ) {
                            let message: string | undefined;
                            let data: Record<string, any> | null = null;

                            if (validationResult instanceof AbolishError) {
                                message = validationResult.message;
                                data = validationResult.data;
                            }

                            message = $error || message;
                            if ($errors && $errors[validatorName]) message = $errors[validatorName];

                            /**
                             * Check if option is stringable
                             * This is required because a rule option could an array or an object
                             * and these cannot be converted to string
                             *
                             * Only strings and numbers can be parsed as :option
                             */
                            const optionIsStringable =
                                typeof validatorOption === "string" ||
                                typeof validatorOption === "number" ||
                                Array.isArray(validatorOption);

                            /**
                             * Replace :param with rule converted to upperCase
                             * and if option is stringable, replace :option with validatorOption
                             */
                            message = (message || validator.error!).replace(
                                ":param",
                                $name ? $name : abolish_StartCase(rule, this)
                            );

                            if (optionIsStringable)
                                message = message.replace(":option", String(validatorOption));

                            // Return Error using the ValidationResult format
                            return [
                                {
                                    key: rule,
                                    type: "validator",
                                    validator: validatorName,
                                    message,
                                    data
                                },
                                {} as R
                            ];
                        }
                    }
                }
            }
        }

        if (isAsync) {
            asyncData.validated = validated;
            asyncData.keysToBeValidated = keysToBeValidated;
            asyncData.includeKeys = includeKeys;

            return asyncData as any;
        }

        // abolish_Pick only keys in rules
        validated = abolish_Pick(validated, keysToBeValidated.concat(includeKeys));

        return [false, validated as R];
    }

    /**
     * Validate Async
     *
     * Waits for all validation defined
     * @param object
     * @param rules
     * @return {Promise<ValidationResult>}
     */
    validateAsync<R = Record<string, any>>(
        object: Record<string, any>,
        rules: Record<keyof R | string, any>
    ): Promise<ValidationResult<R>> {
        /**
         * Get asyncData
         */
        const asyncData: AsyncData = this.validate(object, rules, true) as any;

        /**
         * Destruct values in async data
         */
        const { validated, jobs, keysToBeValidated, includeKeys } = asyncData;

        /**
         * Return a promise
         */
        return new Promise<ValidationResult>(async (resolve) => {
            /**
             * Loop through jobs and run their validators
             */
            for (const job of jobs) {
                const { $name, rule, validator, validatorName, validatorOption, $error, $errors } =
                    job;

                /**
                 * Value of key being validated in object
                 */
                const objectValue = abolish_Get(validated, rule);

                let validationResult: any = false;
                try {
                    /**
                     * Run Validation
                     * Passing required helpers
                     */
                    validationResult = await validator.validator(objectValue, validatorOption, {
                        error: (message: string, data?: any) => new AbolishError(message, data),
                        modifier: new ObjectModifier(validated, rule, $name),
                        abolish: this
                    });
                } catch (e: any) {
                    /**
                     * If error when running defined function
                     * Send error as validationResult with type as 'internal'
                     */
                    return resolve([
                        {
                            key: rule,
                            type: "internal",
                            validator: validatorName,
                            message: e.message,
                            data: e.stack
                        },
                        {}
                    ]);
                }

                if (validationResult === false || validationResult instanceof AbolishError) {
                    let message: string | undefined;
                    let data: Record<string, any> | null = null;

                    if (validationResult instanceof AbolishError) {
                        message = validationResult.message;
                        data = validationResult.data;
                    }

                    message = $error || message;
                    if ($errors && $errors[validatorName]) message = $errors[validatorName];

                    /**
                     * Replace :param with rule converted to upperCase
                     * and if option is stringable, replace :option with validatorOption
                     */
                    message = (message || validator.error!).replace(
                        ":param",
                        $name ? $name : abolish_StartCase(rule, this)
                    )!;

                    /**
                     * Check if option is stringable
                     * This is required because a rule option could an array or an object
                     * and these cannot be converted to string
                     *
                     * Only strings and numbers can be parsed as :option
                     */
                    const optionIsStringable =
                        typeof validatorOption === "string" || typeof validatorOption === "number";

                    if (optionIsStringable)
                        message = message!.replace(":option", String(validatorOption));

                    // Return Error using the ValidationResult format
                    return resolve([
                        {
                            key: rule,
                            type: "validator",
                            validator: validatorName,
                            message: message!,
                            data
                        },
                        {}
                    ]);
                }
            }

            return resolve([false, abolish_Pick(validated, keysToBeValidated.concat(includeKeys))]);
        });
    }

    /**
     * check a variable does not throw error
     * @param variable
     * @param rules
     */
    check<V = any>(variable: V, rules: AbolishRule): [ValidationError | false, V] {
        const [e, v] = this.validate<{ variable: V }>(
            { variable },
            {
                variable: rules,
                // variable is included in-case if skipped
                $include: ["variable"]
            }
        );
        return [e, v?.variable];
    }

    /**
     * Static Check
     * @param variable
     * @param rules
     */
    static check<V = any>(variable: V, rules: AbolishRule): [ValidationError | false, V] {
        return new this().check(variable, rules);
    }

    /**
     * Checks a variable Asynchronously
     * @param variable
     * @param rules
     */
    async checkAsync<V = any>(
        variable: V,
        rules: AbolishRule
    ): Promise<[ValidationError | false, V]> {
        const [e, v] = await this.validateAsync<{ variable: V }>({ variable }, { variable: rules });

        return [e, v?.variable];
    }

    /**
     * Static Check Async
     * @param variable
     * @param rules
     */
    static checkAsync<V = any>(
        variable: V,
        rules: AbolishRule
    ): Promise<[ValidationError | false, V]> {
        return new this().checkAsync(variable, rules);
    }

    /**
     * Validates a variable
     * @param variable
     * @param rules
     */
    attempt<V = any>(variable: V, rules: Record<string, any> | string): V {
        const [e, v] = this.validate<{ variable: V }>(
            { variable },
            {
                variable: rules,
                // variable is included in-case if skipped
                $include: ["variable"]
            }
        );
        if (e) throw new AttemptError(e);
        return v.variable;
    }

    /**
     * Static Attempt
     * @param variable
     * @param rules
     * @param abolish
     */
    static attempt<V = any>(
        variable: V,
        rules: Record<string, any> | string,
        abolish?: typeof Abolish
    ): V {
        return new this().attempt(variable, rules);
    }

    /**
     * Validates a variable Asynchronously, Throws error
     * @param variable
     * @param rules
     */
    async attemptAsync<V = any>(
        variable: V,
        rules: Record<string, any> | string | string[]
    ): Promise<V> {
        const [e, v] = await this.validateAsync<{ variable: V }>(
            { variable },
            {
                variable: rules,
                // variable is included in-case if skipped
                $include: ["variable"]
            }
        );

        if (e) throw new AttemptError(e);

        return v.variable;
    }

    /**
     * Validates a variable Asynchronously, Throws error
     * @param variable
     * @param rules
     */
    static async attemptAsync<V = any>(variable: V, rules: AbolishRule): Promise<V> {
        return new this().attemptAsync(variable, rules);
    }

    /**
     * test a variable, returns boolean
     * @param variable
     * @param rules
     */
    test<V = any>(variable: V, rules: AbolishRule): boolean {
        const [e] = this.check(variable, rules);
        return !e;
    }

    /**
     * Static Check
     * @param variable
     * @param rules
     */
    static test<V = any>(variable: V, rules: AbolishRule): boolean {
        return new this().test(variable, rules);
    }

    /**
     * Checks a variable Asynchronously
     * @param variable
     * @param rules
     */
    async testAsync<V = any>(variable: V, rules: AbolishRule): Promise<boolean> {
        const [e] = await this.checkAsync(variable, rules);
        return !e;
    }

    /**
     * Static Check Async
     * @param variable
     * @param rules
     */
    static testAsync<V = any>(variable: V, rules: AbolishRule): Promise<boolean> {
        return new this().testAsync(variable, rules);
    }
}

export type TypeOfAbolishOrInstance = typeof Abolish | InstanceType<typeof Abolish>;

export default Abolish;
