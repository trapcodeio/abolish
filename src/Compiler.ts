import type {
    $skipRule,
    AbolishValidatorFunctionResult,
    ValidationError,
    ValidationResult
} from "./types";
import AbolishError from "./AbolishError";
import { abolish_Get, abolish_Pick } from "./inbuilt.fn";

export interface CompiledValidator {
    name: string;
    option: any;
    optionString?: string;
    error: string;
    errorFn?: (e: Pick<ValidationError, "code" | "data" | "validator"> & { value: any }) => string;
    func: (
        value: any,
        option: any
    ) => AbolishValidatorFunctionResult | Promise<AbolishValidatorFunctionResult>;
}

export interface AbolishCompiledObject extends AbolishCompiled {
    isObject: true;
}

export interface CompiledRule {
    $skip?: $skipRule;
    validators: CompiledValidator[];
}

export class AbolishCompiled {
    // constructor(public abolish: Abolish) {}
    /**
     * Hold Compiled Object
     */
    public data: Record<
        string,
        {
            $skip?: $skipRule;
            validators: CompiledValidator[];
        }
    > = {};

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
     * Validate Compiled Schema
     * @param data
     */
    public validateObject<R = Record<string, any>>(data: Record<string, any>): ValidationResult<R> {
        if (!this.isObject) {
            throw new Error(
                "Variable compiled schema cannot be used to validate an object, use object compiled schema!"
            );
        }

        const validated: Record<string, any> = { ...data };
        let fields = this.fields;

        for (const field in this.data) {
            const compiled = this.data[field];
            const value = abolish_Get(validated, field, this.fieldsHasDotNotation);

            // Check if skip rule is set
            if (compiled.$skip) {
                let $skip = compiled.$skip as $skipRule;

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

                    // if ($error) {
                    //     if (typeof $error === "function") {
                    //         message = $error({
                    //             code,
                    //             validator: validatorName,
                    //             data,
                    //             value: objectValue
                    //         });
                    //     } else {
                    //         message = $error;
                    //     }
                    // }
                    //
                    // if ($errors && $errors[validatorName]) {
                    //     let customError = $errors[validatorName];
                    //     if (typeof customError === "function") {
                    //         message = customError({ code, data, value: objectValue });
                    //     } else {
                    //         message = customError;
                    //     }
                    // }

                    if (modifiedMessage) {
                        /**
                         * Replace :param with rule converted to upperCase
                         * and if option is stringAble, replace :option with validatorOption
                         */
                        if (message.includes(":param")) {
                            // Replace all :param with field name
                            message = message.replace(":param", field);
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
                        {} as R
                    ];
                }
            }
        }

        let result: R;

        if (fields.length === 1) {
            const onlyField = fields[0];
            result = { [onlyField]: validated[onlyField] } as R;
        } else if (this.fields.length > 1) {
            result = abolish_Pick(validated, this.fields, this.fieldsHasDotNotation) as R;
        } else {
            result = {} as R;
        }

        return [undefined, result];

        // return [false, abolish_Pick(validated, fields, this.fieldsHasDotNotation) as R];
        // return [false, abolish_Pick(validated, this.fields, this.fieldsHasDotNotation) as R];

        // return [
        //     false,
        //     this.fields.length === 1
        //         ? (validated as R)
        //         : (abolish_Pick(validated, this.fields, this.fieldsHasDotNotation) as R)
        // ];
    }

    public validateVariable<T>(variable: T) {
        if (this.isObject) {
            throw new Error(
                "Object compiled cannot be used to validate a variable, use regular compiled schema!"
            );
        }

        this.isObject = true; // set to true to avoid error
        const data = this.validateObject({ variable });
        this.isObject = false; // set back to false

        // get variable from data
        data[1] = data[1].variable;

        return data as ValidationResult<T>;
    }

    public validate<T>(value: T) {
        return this.isObject ? this.validateObject<T>(value) : this.validateVariable(value);
    }
}
