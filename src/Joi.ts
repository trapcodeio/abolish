import Joi from "joi";

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
