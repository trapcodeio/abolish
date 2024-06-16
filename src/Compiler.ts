import type {
    $skipRule,
    AbolishRule,
    AbolishSchema,
    AbolishValidatorFunctionResult,
    ValidationError,
    ValidationResult
} from "./types";
import AbolishError from "./AbolishError";
import { abolish_Get, InstanceOf, abolish_Pick } from "./inbuilt.fn";

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
    customError?: boolean;
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
    validators: Record<string, CompiledValidator>;
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
    public includedFields?: string[];

    /**
     * Allowed Fields when $strict rule is used
     */
    public allowedFields?: string[];

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

    public input!: AbolishRule | AbolishSchema;

    /**
     * Constructor
     * @param input
     */
    constructor(input: AbolishRule | AbolishSchema) {
        Object.defineProperty(this, "input", {
            value: input,
            enumerable: false,
            writable: true
        });
    }

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

        if (this.allowedFields) {
            const objKeys = Object.keys(validated);
            const unknownKeys = objKeys.filter((key) => !this.allowedFields!.includes(key));

            if (unknownKeys.length) {
                return [
                    {
                        code: "object.unknown",
                        type: "internal",
                        key: "$strict",
                        validator: "$strict",
                        message: "Data contains unknown fields!",
                        data: { unknown: unknownKeys }
                    },
                    {} as R
                ];
            }
        }

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
                    if (this.includedFields && !this.includedFields.includes(field)) {
                        fields = fields.filter((f) => f !== field);
                    }

                    continue;
                }
            }

            /**
             * Loop through all compiled validators
             */
            for (const validatorName in compiled.validators) {
                const validator = compiled.validators[validatorName];
                let result: AbolishValidatorFunctionResult = false;

                try {
                    result = validator.func(value, validated) as AbolishValidatorFunctionResult;
                } catch (e: any) {
                    return [
                        {
                            code: "default",
                            key: field,
                            type: "internal",
                            validator: validatorName,
                            message: e.message,
                            data: e.stack
                        },
                        {} as R
                    ];
                }

                if (
                    typeof result !== undefined &&
                    (result === false || InstanceOf(AbolishError, result))
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

        if (this.allowedFields) {
            const objKeys = Object.keys(validated);
            const unknownKeys = objKeys.filter((key) => !this.allowedFields!.includes(key));

            if (unknownKeys.length) {
                return [
                    {
                        code: "object.unknown",
                        type: "internal",
                        key: "$strict",
                        validator: "$strict",
                        message: "Data contains unknown fields!",
                        data: { unknown: unknownKeys }
                    },
                    {} as R
                ];
            }
        }

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
                    if (this.includedFields && !this.includedFields.includes(field)) {
                        fields = fields.filter((f) => f !== field);
                    }

                    continue;
                }
            }

            /**
             * Loop through all compiled validators
             */
            for (const validatorName in compiled.validators) {
                const validator = compiled.validators[validatorName];
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
                    (result === false || InstanceOf(AbolishError, result))
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
        return this.isObject
            ? this.validateObject<T>(value as object)
            : this.validateVariable(value);
    }

    public async validateAsync<T>(value: T) {
        return this.isObject
            ? this.validateObjectAsync<T>(value as object)
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

    /**
     * Change a fields validator option
     * @param fieldName
     * @param validatorName
     * @param option
     */
    public setValidatorOption(validatorName: string, option: any, fieldName?: string) {
        if (!fieldName) {
            if (this.isObject) {
                throw new Error("Field name is required when using object compiled input!");
            } else {
                fieldName = "variable";
            }
        } else if (fieldName && !this.isObject) {
            throw new Error("Field name is not allowed when using variable compiled input!");
        }

        if (this.data[fieldName] && this.data[fieldName].validators[validatorName]) {
            this.data[fieldName].validators[validatorName].option = option;
        }

        return this;
    }

    /**
     * Copy current compiled instance
     * This is useful when you want to use the same compiled input for multiple validation
     * It prevents memory leak
     */
    public copy(): this {
        const copy = new AbolishCompiled(this.input);

        // set other properties
        copy.fields = this.fields;
        copy.includedFields = this.includedFields;
        copy.fieldsHasDotNotation = this.fieldsHasDotNotation;
        copy.isObject = this.isObject;
        copy.async = this.async;
        copy.data = {};

        // copy data
        for (const field in this.data) {
            // copy validators
            const validators: Record<string, CompiledValidator> = {};
            for (const validatorName in this.data[field].validators) {
                validators[validatorName] = {
                    ...this.data[field].validators[validatorName]
                };
            }

            copy.data[field] = {
                $name: this.data[field].$name,
                $skip: this.data[field].$skip,
                validators
            };
        }

        return copy as this;
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

    if (validator.customError) {
        if (validator.errorFn) {
            modifiedMessage = true;
            message = validator.errorFn({
                code,
                data,
                validator: validator.name,
                value
            });
        }
    } else {
        // noinspection SuspiciousTypeOfGuard
        if (InstanceOf(AbolishError, result)) {
            result = result as AbolishError;
            modifiedMessage = true;
            message = result.message;
            data = result.data;
            code = result.code;
        }
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
