import type Abolish from "./Abolish";

/**
 * Register all validators
 * @param abolish
 */
export function registerAllValidators<T extends typeof Abolish>(abolish: T) {
    registerValidators(abolish, "array");
    registerValidators(abolish, "date");
    registerValidators(abolish, "object");
    registerValidators(abolish, "string");
    registerValidators(abolish, "utils");
    registerValidators(abolish, "number");

    return abolish;
}

/**
 * Register Specific Validators
 * @param abolish
 * @param validators
 */
export function registerValidators<T extends typeof Abolish>(
    abolish: T,
    validators: "string" | "array" | "utils" | "object" | "date" | "number"
) {
    switch (validators) {
        case "string":
            return abolish.addGlobalValidators(require("../validators/string"));
        case "date":
            return abolish.addGlobalValidators(require("../validators/date"));
        case "array":
            return abolish.addGlobalValidators(require("../validators/array"));
        case "utils":
            return abolish.addGlobalValidators(require("../validators/utils"));
        case "object":
            return abolish.addGlobalValidators(require("../validators/object"));
        case "number":
            return abolish.addGlobalValidators(require("../validators/number"));
    }
}
