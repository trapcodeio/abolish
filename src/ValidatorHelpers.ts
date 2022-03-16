import type Abolish from "./Abolish";

/**
 * Register all validators
 * @param abolish
 */
export function registerAllValidators<T extends typeof Abolish>(abolish: T) {
    registerValidators(abolish, "string");
    registerValidators(abolish, "array");
    registerValidators(abolish, "utils");

    return abolish;
}

/**
 * Register Specific Validators
 * @param abolish
 * @param validators
 */
export function registerValidators<T extends typeof Abolish>(
    abolish: T,
    validators: "string" | "array" | "utils"
) {
    switch (validators) {
        case "string":
            return abolish.addGlobalValidators(require("../validators/string"));
        case "array":
            return abolish.addGlobalValidators(require("../validators/array"));
        case "utils":
            return abolish.addGlobalValidators(require("../validators/utils"));
    }
}
