import { string } from "joi";
import type { AbolishInlineValidator, AbolishValidator } from "./types";
import { isType } from "./types-checker";

const GlobalValidators: Record<string, AbolishValidator> = {
    default: {
        name: "default",
        description: "Set default value if original value is undefined or null",
        validator(value, def, { modifier }) {
            if (value === undefined || value === null) {
                modifier.setThis(def);
            }
            return true;
        }
    },

    required: {
        name: "required",
        description: "Value is required",
        error: ":param is required.",
        validator: (value: any, option: boolean) => {
            if (!option) {
                return true;
            }

            if (typeof value === "undefined" || value === null) {
                return false;
            } else if (typeof value === "string" || Array.isArray(value)) {
                return value.length > 0;
            }

            return true;
        }
    },

    typeof: {
        name: "typeof",
        description: "Value is typeof :option",
        error: ":param is not typeof :option",
        validator: function $typeof(value: any, option: string | false | string[]) {
            /**
             * If typeof is false then we don't validate this
             */
            if (option === false) return true;

            // check if option is an array in form of a string with comma separated types
            if (typeof option === "string" && option.includes(",")) option = option.split(",");

            return isType(value, option);
        }
    },

    exact: {
        name: "exact",
        error: ":param failed exact validator",
        description: "Value is === :option",
        validator: (value: any, option: string | boolean | number): boolean => {
            return value === option;
        }
    },

    min: {
        name: "min",
        error: ":param is too small. (Min. :option)",
        description: "Number: Value is >= :option",
        validator: (value: any, option: number | string, helpers) => {
            const isNotNumber = isNaN(value);

            /**
             * if is string and string is not a valid number,
             * or if value is a valid array
             * we pass the validation to `minLength`
             */
            if ((typeof value === "string" && isNotNumber) || Array.isArray(value))
                return GlobalValidators.minLength.validator(value, option, helpers);

            // return false if this is not a number
            if (isNotNumber) return false;

            // Parse to Number and compare
            return Number(value) >= Number(option);
        }
    },

    max: {
        name: "max",
        error: ":param is too big. (Max. :option)",
        description: "Number: Value is <= :option",
        validator: (value: any, option: number | string, helpers) => {
            const isNotNumber = isNaN(value);

            /**
             * if is string and string is not a valid number,
             * or if value is a valid array
             * we pass the validation to `minLength`
             */
            if ((typeof value === "string" && isNotNumber) || Array.isArray(value))
                return GlobalValidators.maxLength.validator(value, option, helpers);

            // return false if this is not a number
            if (isNotNumber) return false;

            // Parse to float and compare
            return Number(value) <= Number(option);
        }
    },

    minLength: {
        name: "minLength",
        error: ":param is too short. (Min. :option characters)",
        description: "Value length is >= :option",
        validator: (value: any, option: number | string, { error }) => {
            if (typeof value === "string") {
                return value.trim().length >= Number(option);
            } else if (Array.isArray(value)) {
                return value.length >= Number(option)
                    ? true
                    : error(`:param length is too short. (Min: ${option})`);
            } else {
                return false;
            }
        }
    },

    maxLength: {
        name: "maxLength",
        error: ":param is too long. (Max. :option characters)",
        description: "Value length is <= :option",
        validator: (value: any, option: number | string, { error }) => {
            if (typeof value === "string") {
                return value.trim().length <= Number(option);
            } else if (Array.isArray(value)) {
                return value.length <= Number(option)
                    ? true
                    : error(`:param length is too long. (Max: ${option})`);
            } else {
                return false;
            }
        }
    },

    size: {
        name: "size",
        error: ":param must be of size: [:option]",
        description: "Check the size of a String, Array, or Object",
        validator: (value: any, option: number | number[], { error }) => {
            let size = undefined as number | undefined;

            if (typeof value === "string" || Array.isArray(value)) {
                size = value.length;
            } else if (typeof value === "object") {
                // since we don't know the type of the object, we use `Object.keys`
                // in a try-catch block to avoid throwing an error
                try {
                    size = Object.keys(value).length;
                } catch (e: any) {
                    return error(e.message);
                }
            }

            // if no size is found, we return false
            if (size === undefined) return false;
            // if option is an array, we check if the size is in the array
            else if (Array.isArray(option)) {
                return option.includes(size);
            }

            // if option is a number, we check if the size is equal to it
            return size === Number(option);
        }
    },

    object: {
        name: "object",
        validator: (value, rules, { error, modifier, abolish }) => {
            if (!value || typeof value !== "object") {
                return error(`:param must be an object.`);
            }

            const [err, valid] = abolish.validate(value, rules);
            if (err) return error(err.message, err);

            modifier.setThis(valid);
        },
        description: ["Object: Value is an object"]
    },

    objectAsync: {
        name: "objectAsync",
        isAsync: true,
        validator: async (value, rules, { error, modifier, abolish }) => {
            if (!value || typeof value !== "object") {
                return error(`:param must be an object.`);
            }

            const [err, valid] = await abolish.validateAsync(value, rules);
            if (err) return error(err.message, err);

            modifier.setThis(valid);
        }
    },

    $inline: {
        name: "$inline",
        error: ":param failed inline validation.",
        validator: (v: any, o: AbolishInlineValidator, helpers) => {
            return o(v, helpers);
        },
        description: "Register a custom validation function inline."
    }

    /**
     * Select min/max length has been moved to minLength/maxLength
     */
    // selectMin: {
    //     name: "selectMin",
    //     error: "Select at-least :option :param.",
    //     validator: (value: any, option: number | string, helpers): boolean => {
    //         return GlobalValidators.minLength.validator(value, option, helpers) as boolean;
    //     },
    //     description: "Array: (Alias: minLength)"
    // },
    //
    // selectMax: {
    //     name: "selectMax",
    //     error: "Select at-most :option :param.",
    //     validator: (value: any, option: number | string, helpers): boolean => {
    //         return GlobalValidators.maxLength.validator(value, option, helpers) as boolean;
    //     },
    //     description: "Array: (Alias: maxLength)"
    // },
};

/**
 * Set an alias for `typeof` as `type`
 */
GlobalValidators.type = Object.assign({}, GlobalValidators.typeof);
GlobalValidators.type.name = "type";
GlobalValidators.type.error = ":param is not of type :option";
GlobalValidators.type.description = "Alias: typeof";

/**
 * Loop through all the validators and rename functions to match the name of the validator
 */
for (const key of Object.keys(GlobalValidators)) {
    const validator = GlobalValidators[key];
    Object.defineProperty(validator.validator, "name", {
        value: validator.name
    });
}

export = GlobalValidators;
