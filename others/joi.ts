import Joi from "joi";
import type Abolish from "../src/Abolish";

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
export function useJoi(abolish: typeof Abolish, joi?: Joi.Root) {
    if (!joi) {
        try {
            joi = require("joi") as Joi.Root;
        } catch (e) {
            throw new Error(`Joi not found! Install Joi`);
        }
    }

    /**
     * Add Validator Joi
     */
    return abolish.addGlobalValidator({
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
            let validated: any;
            try {
                validated = joi!.attempt(value, joiSchema);
            } catch (e: any) {
                return error(e.message);
            }

            /**
             * set Value for abolish
             */
            modifier.setThis(validated);

            return true;
        }
    });
}
