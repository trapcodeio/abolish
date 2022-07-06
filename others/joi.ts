import * as Joi from "joi";
import type { TypeOfAbolishOrInstance } from "../src/Abolish";
import type { AbolishValidator } from "../src/types";
import { AddValidatorToClassOrInstance } from "./index";

/**
 * $joi schema helper
 * @param schema
 */
export const $joi = (schema: Joi.Schema | ((joi: Joi.Root) => Joi.Schema)) => {
    if (typeof schema === "function") {
        schema = schema(Joi);
    }
    return { $joi: schema };
};

/**
 * Enables the use of $joi validator
 * @param abolish
 * @param joi
 */
export function useJoi(abolish: TypeOfAbolishOrInstance, joi?: Joi.Root) {
    if (!joi) joi = Joi;

    /**
     * Add Validator Joi
     */
    const validator: AbolishValidator = {
        name: "$joi",
        validator(value, joiSchema: Joi.Schema, { error, modifier }) {
            /**
             * Check if schema is Joi Schema
             */
            if (!joi!.isSchema(joiSchema)) {
                return error(`Invalid JOI schema provided for :param`);
            }

            /**
             * Validate value against joiSchema Passed
             */
            try {
                const validated = joi!.attempt(value, joiSchema);

                /**
                 * set Value for abolish
                 */
                modifier.setThis(validated);

                return true;
            } catch (e: any) {
                return error(e.message);
            }
        }
    };

    AddValidatorToClassOrInstance(abolish, validator);
}
