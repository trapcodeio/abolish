// noinspection DuplicatedCode

import type {
    $errorRule,
    $errorsRule,
    $skipRule,
    AbolishRule,
    AbolishSchema,
    AbolishValidator,
    ValidationError,
    ValidationResult
} from "./types";
import StringToRules from "./StringToRules";
import GlobalValidators from "./GlobalValidators";
import {
    abolish_Get,
    abolish_Omit,
    abolish_Pick,
    abolish_StartCase,
    hasDotNotation
} from "./inbuilt.fn";
import { Rule, Schema } from "./functions";
import AbolishError from "./AbolishError";
import ObjectModifier from "./ObjectModifier";
import { AbolishValidatorFunctionHelper } from "./types";
import {
    AbolishCompiled,
    AbolishCompiledObject,
    CompiledRule,
    CompiledValidator
} from "./Compiler";
import { assertType } from "./types-checker";

type Job = {
    $name: string | false;
    rule: string;
    validator: AbolishValidator;
    validatorName: string;
    validatorOption: any;
    $error: $errorRule | undefined;
    $errors: $errorsRule | undefined;
};

type AsyncData = {
    validated: Record<string, any>;
    jobs: Job[];
    keysToBeValidated: string[];
    includeKeys: string[];
};

export class AttemptError extends Error {
    public error: ValidationError;

    constructor(e: ValidationError) {
        super(e.message);
        this.name = "AttemptError";
        this.error = e;
    }

    static instanceOf(e: any) {
        return e instanceof AttemptError;
    }
}

/**
 * Abolish Super Rules and Keys
 */
export const SuperKeys = Object.freeze({
    Fields: ["*", "$", "$include"],
    Rules: ["$name", "$skip", "$error", "$errors"]
});

interface AbolishConfig {
    useStartCaseInErrors?: boolean;
}

/**
 * Abolish Class
 * @class
 */
class Abolish {
    validators: Record<string, AbolishValidator> = {};

    config: AbolishConfig = { useStartCaseInErrors: true };

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

            // set validator function name
            Object.defineProperty(validator.validator, "name", {
                value: validator.name
            });
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
    static validate<R = Record<string, any>>(
        object: Record<string, any>,
        rules: AbolishSchema<keyof R | string>
    ): ValidationResult<R>;
    static validate<R extends Record<string, any>>(
        object: Record<string, any>,
        rules: AbolishCompiledObject
    ): ValidationResult<R>;
    static validate<R = Record<string, any>>(
        object: Record<string, any>,
        rules: Record<string, any>
    ): ValidationResult<R> {
        return new this().validate<R>(object, rules as AbolishSchema<keyof R | string>);
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
        rules: AbolishSchema<keyof R | string>,
        isAsync?: boolean
    ): ValidationResult<R>;
    validate<R extends Record<string, any>>(
        object: Record<string, any>,
        rules: AbolishCompiledObject,
        isAsync?: boolean
    ): ValidationResult<R>;
    validate<R = Record<string, any>>(
        object: Record<string, any>,
        rules: Record<string, any>,
        isAsync = false
    ): ValidationResult<R> {
        if (rules instanceof AbolishCompiled) {
            return rules.validateObject(object);
        }

        const asyncData: AsyncData = {
            validated: {},
            jobs: [],
            keysToBeValidated: [],
            includeKeys: []
        };

        /**
         * Check for wildcard rules (*, $)
         */
        let internalWildcardRules: any = {};
        if (rules.hasOwnProperty("*") || rules.hasOwnProperty("$")) {
            internalWildcardRules = rules["*"] || rules["$"];

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
        }

        let keysToBeValidated = Object.keys(rules);

        // remove SUPER_RULES from keysToBeValidated
        keysToBeValidated = keysToBeValidated.filter((key) => !SuperKeys.Fields.includes(key));

        // Loop through defined rules
        for (const rule of keysToBeValidated) {
            let ruleData: any = rules[rule];

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
                // delete ruleData["$skip"];

                if (typeof $skip === "function") {
                    $skip = $skip(validated[rule], validated);
                }

                if (typeof $skip !== "boolean") {
                    throw new Error(
                        `$skip value or resolved function value must be a BOOLEAN in RuleFor: (${rule})`
                    );
                }
            }

            /**
             * Run validation if not $skip
             * else remove key from keysToBeValidated
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
                    // delete ruleData["$name"];

                    if (typeof $name !== "string") {
                        throw new Error(`$name must be a string in RuleFor: (${rule})`);
                    }
                }

                /**
                 * check if rules has custom error: $error
                 */
                let $error: $errorRule | undefined;
                if (ruleData.hasOwnProperty("$error")) {
                    $error = ruleData["$error"];
                    // delete ruleData["$error"];

                    // noinspection SuspiciousTypeOfGuard
                    if (!$error || (typeof $error !== "string" && typeof $error !== "function")) {
                        throw new Error(
                            `$error value must be a STRING or FUNCTION in RuleFor: (${rule})`
                        );
                    }
                }

                let $errors: $errorsRule | undefined;
                if (ruleData.hasOwnProperty("$errors")) {
                    $errors = ruleData["$errors"];
                    // delete ruleData["$errors"];

                    // noinspection SuspiciousTypeOfGuard
                    if (!$errors || typeof $errors !== "object") {
                        throw new Error(`$errors value must be an OBJECT in RuleFor: (${rule})`);
                    }
                }

                /**
                 * Append internal Wildcard data
                 */
                ruleData = { ...internalWildcardRules, ...abolish_Omit(ruleData, SuperKeys.Rules) };

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
                     * if rule has dot notation e.g. "address.city"
                     * we use `abolish_Get`
                     * else use normal index
                     */
                    // const objectValue = abolish_Get(validated, rule);
                    // const objectValue = validated[rule];
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
                                    code: "default",
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
                            let code = "default";

                            if (validationResult instanceof AbolishError) {
                                message = validationResult.message;
                                data = validationResult.data;
                                code = validationResult.code;
                            }

                            if ($error) {
                                if (typeof $error === "function") {
                                    message = $error({
                                        code,
                                        validator: validatorName,
                                        data,
                                        value: objectValue
                                    });
                                } else {
                                    message = $error;
                                }
                            }

                            if ($errors && $errors[validatorName]) {
                                let customError = $errors[validatorName];
                                if (typeof customError === "function") {
                                    message = customError({
                                        code,
                                        data,
                                        validator: validatorName,
                                        value: objectValue
                                    });
                                } else {
                                    message = customError;
                                }
                            }

                            /**
                             * Check if option is stringAble
                             * This is required because a rule option could an array or an object
                             * and these cannot be converted to string
                             *
                             * Only strings and numbers can be parsed as :option
                             */
                            const optionIsStringAble =
                                typeof validatorOption === "string" ||
                                typeof validatorOption === "number" ||
                                Array.isArray(validatorOption);

                            /**
                             * Replace :param with rule converted to upperCase
                             * and if option is stringAble, replace :option with validatorOption
                             */
                            message = (message || validator.error!).replace(
                                ":param",
                                $name ? $name : abolish_StartCase(rule, this)
                            );

                            if (optionIsStringAble)
                                message = message.replace(":option", String(validatorOption));

                            // Return Error using the ValidationResult format
                            return [
                                {
                                    code,
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

        return [undefined, validated as R];
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
        rules: AbolishSchema<keyof R | string>
    ): Promise<ValidationResult<R>>;
    validateAsync<R extends Record<string, any>>(
        object: Record<string, any>,
        rules: AbolishCompiledObject
    ): Promise<ValidationResult<R>>;
    validateAsync<R = Record<string, any>>(
        object: Record<string, any>,
        rules: Record<string, any>
    ): Promise<ValidationResult<R>> {
        if (rules instanceof AbolishCompiled) {
            return rules.validateObjectAsync(object);
        }
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
                            code: "default",
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
                    let code = "default";

                    if (validationResult instanceof AbolishError) {
                        message = validationResult.message;
                        data = validationResult.data;
                        code = validationResult.code;
                    }

                    if ($error) {
                        if (typeof $error === "function") {
                            message = $error({
                                code,
                                validator: validatorName,
                                data,
                                value: objectValue
                            });
                        } else {
                            message = $error;
                        }
                    }

                    if ($errors && $errors[validatorName]) {
                        let customError = $errors[validatorName];
                        if (typeof customError === "function") {
                            message = customError({
                                code,
                                data,
                                validator: validatorName,
                                value: objectValue
                            });
                        } else {
                            message = customError;
                        }
                    }

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
                    const optionIsStringAble =
                        typeof validatorOption === "string" || typeof validatorOption === "number";

                    if (optionIsStringAble)
                        message = message!.replace(":option", String(validatorOption));

                    // Return Error using the ValidationResult format
                    return resolve([
                        {
                            code,
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

            return resolve([
                undefined,
                abolish_Pick(validated, keysToBeValidated.concat(includeKeys))
            ]);
        });
    }

    /**
     * check a variable does not throw error
     * @param variable
     * @param rules
     */
    check<V = any>(variable: V, rules: AbolishRule | AbolishCompiled): ValidationResult<V> {
        if (rules instanceof AbolishCompiled) {
            return rules.validateVariable(variable);
        }

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
    static check<V = any>(variable: V, rules: AbolishRule | AbolishCompiled): ValidationResult<V> {
        return new this().check(variable, rules);
    }

    /**
     * Checks a variable Asynchronously
     * @param variable
     * @param rules
     */
    async checkAsync<V = any>(
        variable: V,
        rules: AbolishRule | AbolishCompiled
    ): Promise<ValidationResult<V>> {
        if (rules instanceof AbolishCompiled) {
            return rules.validateVariableAsync(variable);
        }

        const [e, v] = await this.validateAsync<{ variable: V }>(
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
     * Static Check Async
     * @param variable
     * @param rules
     */
    static checkAsync<V = any>(variable: V, rules: AbolishRule): Promise<ValidationResult<V>> {
        return new this().checkAsync(variable, rules);
    }

    /**
     * Validates a variable
     * @param variable
     * @param rules
     */
    attempt<V = any>(variable: V, rules: AbolishRule | AbolishCompiled): V {
        const data = this.check<V>(variable, rules);
        if (data[0]) throw new AttemptError(data[0]);
        return data[1];
    }

    /**
     * Static Attempt
     * @param variable
     * @param rules
     * @param abolish
     */
    static attempt<V = any>(
        variable: V,
        rules: AbolishRule | AbolishCompiled,
        abolish?: typeof Abolish
    ): V {
        return new this().attempt(variable, rules);
    }

    /**
     * Validates a variable Asynchronously, Throws error
     * @param variable
     * @param rules
     */
    async attemptAsync<V = any>(variable: V, rules: AbolishRule | AbolishCompiled): Promise<V> {
        const data = await this.checkAsync(variable, rules);

        if (data[0]) throw new AttemptError(data[0]);

        return data[1];
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
    test<V = any>(variable: V, rules: AbolishRule | AbolishCompiled): boolean {
        const data = this.check(variable, rules);
        return !data[0];
    }

    /**
     * Static Check
     * @param variable
     * @param rules
     */
    static test<V = any>(variable: V, rules: AbolishRule | AbolishCompiled): boolean {
        return new this().test(variable, rules);
    }

    /**
     * Checks a variable Asynchronously
     * @param variable
     * @param rules
     */
    async testAsync<V = any>(variable: V, rules: AbolishRule): Promise<boolean> {
        const data = await this.checkAsync(variable, rules);
        return !data[0];
    }

    /**
     * Static Check Async
     * @param variable
     * @param rules
     */
    static testAsync<V = any>(variable: V, rules: AbolishRule): Promise<boolean> {
        return new this().testAsync(variable, rules);
    }

    /**
     * Compile a input
     * @param schema
     * @param CustomAbolish
     */
    static compileObject<S extends AbolishSchema>(
        schema: S,
        CustomAbolish?: TypeOfAbolishOrInstance
    ) {
        const abolish = CustomAbolish
            ? isAbolishInstance(CustomAbolish)
                ? (CustomAbolish as Abolish)
                : new (CustomAbolish as typeof Abolish)()
            : new Abolish();

        const compiled = new AbolishCompiled(Schema(schema));

        let internalWildcardRules: AbolishRule | undefined;
        let includeFields: string[] = [];

        for (const [field, rules] of Object.entries(schema)) {
            /**
             * Check for wildcard rules (*, $)
             */
            if (["*", "$"].includes(field)) {
                internalWildcardRules = rules;

                /**
                 * Convert rules[*] to object if string
                 * Using StringToRules function
                 */
                if (typeof internalWildcardRules === "string")
                    internalWildcardRules = StringToRules(internalWildcardRules);
            } else if (field === "$include") {
                includeFields = rules as string[];
            }
        }

        /**
         * Loop Through each field and rule
         */
        for (const [field, rules] of Object.entries(schema)) {
            if (SuperKeys.Fields.includes(field)) continue;

            const compiledRule: CompiledRule = { validators: [] };

            /**
             * Convert ruleData to object if string
             * Using StringToRules function
             */
            let parsedRules: any = rules;
            if (typeof rules === "string") {
                parsedRules = StringToRules(rules);
            } else if (Array.isArray(rules)) {
                parsedRules = Rule(rules);
            }

            if (internalWildcardRules) {
                parsedRules = { ...(internalWildcardRules as Record<string, any>), ...parsedRules };
            }

            let $error: $errorRule | undefined;
            let $errors: $errorsRule = {};

            /**
             * Loop Through each rule and generate validator
             */
            for (const [validatorName, option] of Object.entries(parsedRules)) {
                if (!SuperKeys.Rules.includes(validatorName)) continue;

                if (validatorName === "$name") {
                    assertType(option, ["string"], "$name");
                    compiledRule.$name = option as string;
                } else if (validatorName === "$skip") {
                    // $skip = option as $skipRule;
                    assertType(option, ["boolean", "function"], "$skip");
                    // set skip
                    compiledRule.$skip = option as $skipRule;
                } else if (validatorName === "$error") {
                    // $error = option as $errorRule;
                    assertType(option, ["string", "function"], "$error");
                    $error = option as $errorRule;
                } else if (validatorName === "$errors") {
                    // $errors = option as Record<string, $errorRule>;
                    assertType(option, ["object"], "$errors");
                    $errors = option as $errorsRule;
                }
            }

            if (!compiledRule.$name && abolish.config.useStartCaseInErrors) {
                compiledRule.$name = abolish_StartCase(field);
            }

            /**
             * Object modifier
             */
            const modifier = new ObjectModifier({}, field).flagNoData();

            /**
             * Loop Through each rule and generate validator
             */
            for (const [validatorName, option] of Object.entries(parsedRules)) {
                if (SuperKeys.Rules.includes(validatorName)) continue;

                const validator = (abolish.validators[validatorName] ||
                    GlobalValidators[validatorName]) as AbolishValidator;

                if (!validator) throw new Error(`Validator ${validatorName} not found`);

                if (validator.isAsync) compiled.async = true;

                /**
                 * Check if option is stringAble
                 * This is required because a rule option could an array or an object
                 * and these cannot be converted to string
                 *
                 * Only strings and numbers can be parsed as :option
                 */
                const optionIsStringAble =
                    typeof option === "string" ||
                    typeof option === "number" ||
                    typeof option === "boolean" ||
                    Array.isArray(option);

                const ctx: AbolishValidatorFunctionHelper = {
                    abolish,
                    modifier,
                    error: (message: string, data?: any) => new AbolishError(message, data)
                };

                // If no error defined set default error
                if (!validator.error)
                    validator.error = `:param failed {${validator.name}} validation.`;

                /**
                 * Parse error
                 */
                let error = validator.error;
                let errorFn: CompiledValidator["errorFn"];

                /**
                 * Process $error
                 * if $error is a string, use it as error message
                 * if $error is a function, use it as error function
                 */
                if ($error) {
                    if (typeof $error === "string") {
                        error = $error;
                    } else if (typeof $error === "function") {
                        errorFn = $error;
                    }
                }

                if ($errors && $errors[validatorName]) {
                    const errorMessage = $errors[validatorName];
                    if (typeof errorMessage === "string") {
                        error = errorMessage;
                    } else if (typeof errorMessage === "function") {
                        errorFn = errorMessage;
                    }
                }

                if (error.includes(":param")) {
                    // replace all :param with field name
                    error = error.replace(/:param/g, compiledRule.$name || field);
                }

                const data: CompiledValidator = {
                    name: validatorName,
                    option: option,
                    error: error,
                    async: validator.isAsync === true,
                    func: (value: any, data: Record<string, any>) => {
                        if (!ctx.modifier.hasData) ctx.modifier.setData(data);
                        return validator.validator(value, option, ctx);
                    }
                };

                if (errorFn) data.errorFn = errorFn;

                if (optionIsStringAble) {
                    data.optionString = String(option);
                    data.error = data.error.replace(/:option/g, data.optionString);
                }

                // Set validator name
                Object.defineProperty(data.func, "name", {
                    value: `Wrapped(${validatorName})`
                });

                compiledRule.validators.push(data);
            }

            compiled.data[field] = compiledRule;
        }

        // Populate Fields to be picked
        // In order to make sure unique fields are picked
        // We have to loop and check if the field is already picked
        Object.keys(compiled.data).forEach((field) => {
            if (!compiled.fields.includes(field)) compiled.fields.push(field);
        });

        includeFields.forEach((field) => {
            if (!compiled.fields.includes(field)) compiled.fields.push(field);
        });

        compiled.includedFields = includeFields;

        // Check if any field has dot notation
        compiled.fieldsHasDotNotation = compiled.fields.some(hasDotNotation);

        return compiled as AbolishCompiledObject;
    }

    /**
     * Compile for a variable
     * @param rule
     * @param CustomAbolish
     */
    static compile(rule: AbolishRule, CustomAbolish?: TypeOfAbolishOrInstance) {
        // process rules;
        rule = Rule(rule);

        // compile
        const compiled = this.compileObject(
            {
                variable: rule,
                $include: ["variable"]
            },
            CustomAbolish
        ) as AbolishCompiled;

        // set exact rules received
        compiled.input = rule;

        // set object to false.
        compiled.isObject = false;

        return compiled;
    }
}

export type TypeOfAbolishOrInstance = typeof Abolish | InstanceType<typeof Abolish>;

/**
 * Check if a variable can be considered as an Abolish Class
 * @param $class
 */
export function isAbolishClass($class: any) {
    return typeof $class === "function" && typeof $class["addGlobalValidator"] === "function";
}

/**
 * Check if a variable can be considered as an Abolish Instance
 * @param instance
 */
export function isAbolishInstance(instance: any) {
    return (
        typeof instance === "object" &&
        (instance instanceof Abolish || typeof instance["addValidator"] === "function")
    );
}

export default Abolish;
