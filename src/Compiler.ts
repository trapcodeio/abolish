import { AbolishValidatorFunctionResult, ValidationResult } from "./types";
import AbolishError from "./AbolishError";
import { abolish_Get, abolish_Pick } from "./inbuilt.fn";

export interface CompiledData {
    // $name?: string;
    // $skip?: (value: any) => boolean;
    // $error?: $errorRule;
    // $errors?: $errorsRule;
    // field: string;
    validatorName: string;
    validatorOption: any;
    validatorOptionString?: string;
    validatorError: string;
    validator: (
        value: any,
        option: any
    ) => AbolishValidatorFunctionResult | Promise<AbolishValidatorFunctionResult>;
}

export interface AbolishCompiledObject extends AbolishCompiled {
    isObject: true;
}

export class AbolishCompiled {
    // constructor(public abolish: Abolish) {}
    /**
     * Hold Compiled Object
     */
    public data: Record<string, CompiledData[]> = {};

    /**
     * Schema Keys and Included Fields
     */
    public fields: string[] = [];

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

        for (const field in this.data) {
            const compiledList = this.data[field];
            const value = abolish_Get(validated, field, this.fieldsHasDotNotation);

            for (const compiled of compiledList) {
                let result: AbolishValidatorFunctionResult = false;

                try {
                    result = compiled.validator(value, validated) as AbolishValidatorFunctionResult;
                } catch (e: any) {
                    return [
                        {
                            code: "default",
                            key: field,
                            type: "internal",
                            validator: compiled.validatorName,
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
                    let message = compiled.validatorError;
                    let data: Record<string, any> | null = null;
                    let code = "default";

                    if (result instanceof AbolishError) {
                        message = result.message;
                        data = result.data;
                        code = result.code;
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

                    /**
                     * Replace :param with rule converted to upperCase
                     * and if option is stringAble, replace :option with validatorOption
                     */
                    message = message.replace(
                        ":param",
                        // $name ? $name : abolish_StartCase(rule, this)
                        field
                    );

                    if (compiled.validatorOptionString)
                        message = message.replace(":option", compiled.validatorOptionString);

                    // Return Error using the ValidationResult format
                    return [
                        {
                            code,
                            key: field,
                            type: "validator",
                            validator: compiled.validatorName,
                            message,
                            data
                        },
                        {} as R
                    ];
                }
            }
        }

        return [
            false,
            this.fields.length <= 1
                ? (validated as R)
                : (abolish_Pick(validated, this.fields, this.fieldsHasDotNotation) as R)
        ];
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
        return this.isObject ? this.validateObject(value) : this.validateVariable(value);
    }
}
