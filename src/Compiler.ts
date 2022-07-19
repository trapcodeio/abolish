import { AbolishValidatorFunctionResult, ValidationResult } from "./types";
import AbolishError from "./AbolishError";
import { abolish_Pick } from "./inbuilt.fn";

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

export interface AbolishVariableCompiled extends AbolishCompiled {
    variable?: true;
}

export class AbolishCompiled {
    // constructor(public abolish: Abolish) {}
    /**
     * Hold Compiled Object
     */
    public data: Record<string, CompiledData[]> = {};

    /**
     * Fields to be included in validation result
     */
    public include: string[] = [];

    /**
     * Is Object is true, but if a variable is passed, it will return false
     */
    public isObject = true;

    /**
     * Validate Compiled Schema
     * @param data
     */
    public validateObject<R = Record<string, any>>(data: Record<string, any>): ValidationResult<R> {
        const validated: Record<string, any> = { ...data };

        for (const field in this.data) {
            const compiledList = this.data[field];
            const value = validated[field];

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

                if (result === false || result instanceof AbolishError) {
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
            Object.keys(validated).length <= 1
                ? (validated as R)
                : abolish_Pick(validated, Object.keys(this.data).concat(this.include))
        ];
    }

    public validateVariable<T>(variable: T) {
        const data = this.validateObject({ variable });
        if (!data[0]) data[1] = data[1].variable;
        return data;
    }

    public validate<T>(value: T) {
        return this.isObject ? this.validateObject(value) : this.validateVariable(value);
    }
}
