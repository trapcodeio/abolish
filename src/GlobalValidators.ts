import type { AbolishInlineValidator, AbolishValidator } from "./Types";

/**
 * @param value
 * @return {string}
 * @private
 */

function trimIfString(value: string | any): string | any {
    return typeof value === "string" ? value.trim() : value;
}

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
        validator: (value: any, option: boolean): boolean => {
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
        error: ":param is not typeof :option",
        validator: (value: any, option: string | false): boolean => {
            /**
             * If typeof is false then we don't validate this
             */
            if (option === false) return true;

            option = option.toLowerCase();
            if (option === "array") return Array.isArray(value);
            return typeof value === option;
        },
        description: "Value is typeof :option"
    },

    exact: {
        name: "exact",
        validator: (value: any, option: any): boolean => {
            return value === option;
        },
        error: ":param failed exact validator",
        description: "Value is === :option"
    },

    min: {
        name: "min",
        error: ":param is too small. (Min. :option)",
        validator: (value: any, option: number | string, helpers): boolean => {
            const isNotNumber = isNaN(value);

            /**
             * if is string and string is not a valid number,
             * or if value is a valid array
             * we pass the validation to `minLength`
             */
            if ((typeof value === "string" && isNotNumber) || Array.isArray(value))
                return GlobalValidators.minLength.validator(value, option, helpers) as boolean;

            // return false if this is not a number
            if (isNotNumber) return false;

            // Parse to Number and compare
            return Number(value) >= Number(option);
        },
        description: "Number: Value is >= :option"
    },

    max: {
        name: "max",
        error: ":param is too big. (Max. :option)",
        validator: (value: any, option: number | string, helpers): boolean => {
            const isNotNumber = isNaN(value);

            /**
             * if is string and string is not a valid number,
             * or if value is a valid array
             * we pass the validation to `minLength`
             */
            if ((typeof value === "string" && isNotNumber) || Array.isArray(value))
                return GlobalValidators.maxLength.validator(value, option, helpers) as boolean;

            // return false if this is not a number
            if (isNotNumber) return false;

            // Parse to float and compare
            return Number(value) <= Number(option);
        },
        description: "Number: Value is <= :option"
    },

    minLength: {
        name: "minLength",
        error: ":param is too short. (Min. :option characters)",
        validator: (value: any, option: number | string): boolean => {
            if (typeof value !== "string" && !Array.isArray(value)) return false;

            value = trimIfString(value);
            return value.length >= Number(option);
        },
        description: "[Array, String]: Value has >= :option characters"
    },

    maxLength: {
        name: "maxLength",
        error: ":param is too long. (Max. :option characters)",
        validator: (value: any, option: number | string): boolean => {
            if (typeof value !== "string" && !Array.isArray(value)) return false;

            value = trimIfString(value);
            return value.length <= Number(option);
        },
        description: "[Array, String]: Value has <= :option characters"
    },

    selectMin: {
        name: "selectMin",
        error: "Select at-least :option :param.",
        validator: (value: any, option: number | string, helpers): boolean => {
            return GlobalValidators.minLength.validator(value, option, helpers) as boolean;
        },
        description: "Array: (Alias: minLength)"
    },

    selectMax: {
        name: "selectMax",
        error: "Select at-most :option :param.",
        validator: (value: any, option: number | string, helpers): boolean => {
            return GlobalValidators.maxLength.validator(value, option, helpers) as boolean;
        },
        description: "Array: (Alias: maxLength)"
    },

    $inline: {
        name: "$inline",
        error: ":param failed inline validation.",
        validator: (v: any, o: AbolishInlineValidator, helpers) => {
            return o(v, helpers);
        },
        description: "Register a custom validation function inline."
    }
};

/**
 * Set an alias for `typeof` as `type`
 */
GlobalValidators.type = Object.assign({}, GlobalValidators.typeof);
GlobalValidators.type.name = "type";
GlobalValidators.type.error = ":param is not of type :option";
GlobalValidators.type.description = "Alias: typeof";

export default GlobalValidators;
