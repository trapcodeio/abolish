import * as Yup from "yup";
import type { TypeOfAbolishOrInstance } from "../src/Abolish";
import type { AbolishValidator } from "../src/types";
import { AddValidatorToClassOrInstance } from "./index";
import type { ValidateOptions } from "yup/es/types";

export type YupSchemaOption<T extends Yup.BaseSchema> = { schema: T; options?: ValidateOptions };
type YupHelper<T> = (y: typeof Yup) => T;

declare module "../src/validator" {
    module AvailableValidators {
        interface Options {
            $yup: Yup.BaseSchema | YupSchemaOption<any>;
            $yupAsync: Yup.BaseSchema | YupSchemaOption<any>;
        }
    }
}

/**
 * $yup Schema Helper
 */
export function $yup<T extends Yup.BaseSchema>(
    schema: YupHelper<T>,
    options?: ValidateOptions
): Record<"$yup", YupSchemaOption<T>>;
export function $yup<T extends Yup.BaseSchema>(
    schema: T,
    options?: ValidateOptions
): Record<"$yup", YupSchemaOption<T>>;
export function $yup<T extends Yup.BaseSchema>(
    schema: T | YupHelper<T>,
    options?: ValidateOptions
) {
    // if input is a function, call it
    if (typeof schema === "function") {
        schema = schema(Yup) as T;
    }

    return { $yup: { schema, options } };
}

/**
 * $yup Async Helper
 */
export function $yupAsync<T extends Yup.BaseSchema>(
    schema: YupHelper<T>,
    options?: ValidateOptions
): Record<"$yupAsync", YupSchemaOption<T>>;
export function $yupAsync<T extends Yup.BaseSchema>(
    schema: T,
    options?: ValidateOptions
): Record<"$yupAsync", YupSchemaOption<T>>;
export function $yupAsync<T extends Yup.BaseSchema>(
    schema: T | YupHelper<T>,
    options?: ValidateOptions
) {
    if (typeof schema === "function") {
        schema = schema(Yup) as T;
    }

    return { $yupAsync: { schema, options } };
}

/**
 * Check if this is a yup input option
 * @param schema
 */
function isSchemaOption(schema: Yup.BaseSchema | YupSchemaOption<Yup.BaseSchema>) {
    const keys = Object.keys(schema);
    return keys.includes("schema");
}

export function useYup(abolish: TypeOfAbolishOrInstance) {
    const validator: AbolishValidator = {
        name: "$yup",
        validator: (value, options: YupSchemaOption<any>, { error, modifier }) => {
            if (!isSchemaOption(options)) options = { schema: options };

            try {
                const validated = options.schema.validateSync(value, options.options);
                modifier.setThis(validated);

                return true;
            } catch (e: any) {
                return error(e.message);
            }
        }
    };

    const asyncValidator: AbolishValidator = {
        name: "$yupAsync",
        isAsync: true,
        validator: async (value, options: YupSchemaOption<any>, { error, modifier }) => {
            if (!isSchemaOption(options)) options = { schema: options };

            try {
                const validated = await options.schema.validate(value, options.options);

                modifier.setThis(validated);

                return true;
            } catch (e: any) {
                return error(e.message);
            }
        }
    };

    AddValidatorToClassOrInstance(abolish, validator);
    AddValidatorToClassOrInstance(abolish, asyncValidator);
}
