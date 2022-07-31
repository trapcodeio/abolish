import type {
    $skipRule,
    AbolishRule,
    AbolishSchema,
    AbolishValidatorFunctionResult,
    ValidationError,
    ValidationResult
} from "./types";
import AbolishError from "./AbolishError";
import { abolish_Get, abolish_Pick } from "./inbuilt.fn";

/**
 * Compiled Validator Type
 */
export interface CompiledValidator {
    name: string;
    option: any;
    optionString?: string;
    error: string;
    async: boolean;
    errorFn?: (e: Pick<ValidationError, "code" | "data" | "validator"> & { value: any }) => string;
    func: (
        value: any,
        option: any
    ) => AbolishValidatorFunctionResult | Promise<AbolishValidatorFunctionResult>;
}

/**
 * Abolish Compiled Object Version.
 */
export interface AbolishCompiledObject extends AbolishCompiled {
    isObject: true;
}

/**
 * Compiled Rule
 */
export interface CompiledRule {
    $skip?: $skipRule;
    $name?: string;
    validators: CompiledValidator[];
}

export class AbolishCompiled {
    /**
     * Hold Compiled Object
     */
    public data: Record<string, CompiledRule> = {};

    /**
     * Schema Keys and Included Fields
     */
    public fields: string[] = [];

    /**
     * Fields included
     */
    public includedFields: string[] = [];

    /**
     * If fields has any dot notation set to true
     */
    public fieldsHasDotNotation = false;

    /**
     * Is Object is true, but if a variable is passed, it will return false
     */
    public isObject = true;

    /**
     * if there is an async validator, set to true
     */
    public async = false;

    /**
     * Constructor
     * @param input
     */
    constructor(public input: AbolishRule | AbolishSchema) {}

    /**
     * Validate Compiled Schema
     * @param data
     */
    public validateObject<R = Record<string, any>>(data: Record<string, any>): ValidationResult<R> {
        /**
         * If this compiled input is not an object, throw error
         */
        if (!this.isObject) {
            throw new Error(
                "Variable compiled input cannot be used to validate an object, use object compiled input!"
            );
        }

        /**
         * If this compiled input is async, throw error
         */
        if (this.async) {
            throw new Error("Rules contains an async validator, use validateObjectAsync instead!");
        }

        /**
         * Validate Object
         */
        const validated: Record<string, any> = { ...data };

        /**
         * Hold current fields
         * This will be used in the skip section to remove fields that are not included in the input
         */
        let fields = this.fields;

        /**
         * Loop through all the fields in the input
         */
        for (const field in this.data) {
            const compiled = this.data[field];

            // Current field value
            const value = abolish_Get(validated, field, this.fieldsHasDotNotation);

            // Check if skip rule is set
            if (compiled.$skip) {
                let $skip = compiled.$skip as $skipRule;

                // Run skip if it is a function
                if (typeof $skip === "function") {
                    $skip = $skip(value, validated);
                }

                if ($skip) {
                    // if field is not in included fields, remove it from fields
                    if (!this.includedFields.includes(field)) {
                        fields = fields.filter((f) => f !== field);
                    }

                    continue;
                }
            }

            /**
             * Loop through all compiled validators
             */
            for (const validator of compiled.validators) {
                let result: AbolishValidatorFunctionResult = false;

                try {
                    result = validator.func(value, validated) as AbolishValidatorFunctionResult;
                } catch (e: any) {
                    return [
                        {
                            code: "default",
                            key: field,
                            type: "internal",
                            validator: validator.name,
                            message: e.message,
                            data: e.stack
                        },
                        {} as R
                    ];
                }

                if (
                    typeof result !== undefined &&
                    (result === false || result instanceof AbolishError)
                ) {
                    return parseErrorMessage(
                        field,
                        value,
                        result,
                        validator,
                        compiled.$name
                    ) as ValidationResult<R>;
                }
            }
        }

        let result: R;

        if (fields.length === 1) {
            const onlyField = fields[0];
            result = { [onlyField]: validated[onlyField] } as R;
        } else if (fields.length > 1) {
            result = abolish_Pick(validated, fields, this.fieldsHasDotNotation) as R;
        } else {
            result = {} as R;
        }

        return [undefined, result];
    }

    public async validateObjectAsync<R = Record<string, any>>(
        data: Record<string, any>
    ): Promise<ValidationResult<R>> {
        /**
         * If this compiled input is not an object, throw error
         */
        if (!this.isObject) {
            throw new Error(
                "Variable compiled input cannot be used to validate an object, use object compiled input!"
            );
        }

        /**
         * Validate Object
         */
        const validated: Record<string, any> = { ...data };

        /**
         * Hold current fields
         * This will be used in the skip section to remove fields that are not included in the input
         */
        let fields = this.fields;

        /**
         * Loop through all the fields in the input
         */
        for (const field in this.data) {
            const compiled = this.data[field];

            // Current field value
            const value = abolish_Get(validated, field, this.fieldsHasDotNotation);

            // Check if skip rule is set
            if (compiled.$skip) {
                let $skip = compiled.$skip as $skipRule;

                // Run skip if it is a function
                if (typeof $skip === "function") {
                    $skip = $skip(value, validated);
                }

                if ($skip) {
                    // if field is not in included fields, remove it from fields
                    if (!this.includedFields.includes(field)) {
                        fields = fields.filter((f) => f !== field);
                    }

                    continue;
                }
            }

            /**
             * Loop through all compiled validators
             */
            for (const validator of compiled.validators) {
                let result: AbolishValidatorFunctionResult = false;

                try {
                    if (validator.async) {
                        result = (await validator.func(
                            value,
                            validated
                        )) as AbolishValidatorFunctionResult;
                    } else {
                        result = validator.func(value, validated) as AbolishValidatorFunctionResult;
                    }
                } catch (e: any) {
                    return [
                        {
                            code: "default",
                            key: field,
                            type: "internal",
                            validator: validator.name,
                            message: e.message,
                            data: e.stack
                        },
                        {} as R
                    ];
                }

                if (
                    typeof result !== undefined &&
                    (result === false || result instanceof AbolishError)
                ) {
                    return parseErrorMessage(
                        field,
                        value,
                        result,
                        validator,
                        compiled.$name
                    ) as ValidationResult<R>;
                }
            }
        }

        let result: R;

        if (fields.length === 1) {
            const onlyField = fields[0];
            result = { [onlyField]: validated[onlyField] } as R;
        } else if (fields.length > 1) {
            result = abolish_Pick(validated, fields, this.fieldsHasDotNotation) as R;
        } else {
            result = {} as R;
        }

        return [undefined, result];
    }

    /**
     * Validate a variable using a variable compiled input
     * @param variable Variable to validate
     * @returns
     */
    public validateVariable<T>(variable: T) {
        if (this.isObject) {
            throw new Error(
                "Object compiled cannot be used to validate a variable, use regular compiled input!"
            );
        }

        this.isObject = true; // set to true to avoid error
        const data = this.validateObject({ variable });
        this.isObject = false; // set back to false

        // get variable from data
        data[1] = data[1].variable;

        return data as ValidationResult<T>;
    }

    /**
     * validateVariable async version
     * @param variable Variable to validate
     * @returns
     */
    public async validateVariableAsync<T>(variable: T) {
        if (this.isObject) {
            throw new Error(
                "Object compiled cannot be used to validate a variable, use regular compiled input!"
            );
        }

        this.isObject = true; // set to true to avoid error
        const data = await this.validateObjectAsync({ variable });
        this.isObject = false; // set back to false

        // get variable from data
        data[1] = data[1].variable;

        return data as ValidationResult<T>;
    }

    public validate<T>(value: T) {
        return this.isObject ? this.validateObject<T>(value) : this.validateVariable(value);
    }

    public async validateAsync<T>(value: T) {
        return this.isObject
            ? this.validateObjectAsync<T>(value)
            : this.validateVariableAsync(value);
    }

    /**
     * Get `this.input` as AbolishRule
     */
    public getInputRule() {
        return this.input as AbolishRule;
    }

    /**
     * Get `this.input` as AbolishSchema
     */
    public getInputSchema() {
        return this.input as AbolishSchema;
    }
}

/**
 * Parse Error Message
 * @param field - Field
 * @param value - Value
 * @param result - Result
 * @param validator - Validator
 * @param $name - Name of field
 * @returns
 */
function parseErrorMessage(
    field: string,
    value: any,
    result: AbolishValidatorFunctionResult,
    validator: CompiledValidator,
    $name?: string
) {
    let message = validator.error;
    let data: Record<string, any> | null = null;
    let code = "default";
    let modifiedMessage = false;

    if (result instanceof AbolishError) {
        modifiedMessage = true;
        message = result.message;
        data = result.data;
        code = result.code;
    }

    if (validator.errorFn) {
        modifiedMessage = true;
        message = validator.errorFn({
            code,
            data,
            validator: validator.name,
            value
        });
    }

    if (modifiedMessage) {
        /**
         * Replace :param with rule converted to upperCase
         * and if option is stringAble, replace :option with validatorOption
         */
        if (message.includes(":param")) {
            // Replace all :param with field name
            message = message.replace(":param", $name || field);
        }

        if (validator.optionString && message.includes(":option"))
            message = message.replace(":option", validator.optionString);
    }

    // Return Error using the ValidationResult format
    return [
        {
            code,
            key: field,
            type: "validator",
            validator: validator.name,
            message,
            data
        },
        {}
    ];
}
