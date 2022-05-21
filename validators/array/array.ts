import type { AbolishValidator } from "../../src/Types";
import { assertType } from "../../src/types-checker";

export = <AbolishValidator>{
    name: "array",
    error: ":param is not a valid array!",
    validator(value: any[], option: boolean | number | string | string[], { error }) {
        assertType(option, ["boolean", "number", "string", "array"]);

        /**
         * If option is false then we don't validate this
         *  else if option is boolean then we validate if it is an array
         *  else if option is number then we validate if it is an array and the length is equal to the size
         *  else if option is string or array of strings then we validate
         *  if it is an array and the values are of the given types.
         */
        if (option === false) return true;
        else if (option === true) return Array.isArray(value);
        else {
            // Check if is array, so we don't have to check again
            const isArray = Array.isArray(value);
            if (!isArray) return false;

            // Now we are sure that it is an array
            // We can run the remaining checks.
            if (typeof option === "number") {
                if (value.length === option) return true;
                return error(
                    `:param array length must be [${option}], but [${value.length}] was given.`
                );
            } else if (typeof option === "string" || Array.isArray(option)) {
                return arrayValuesIsTypeOf(value, option)
                    ? true
                    : error(`:param array values must be of type: [${option}]`);
            }
        }
    }
};

/**
 * Function that checks if an array values is of the given types.
 */
function arrayValuesIsTypeOf(arr: any[], types: string | string[]) {
    if (typeof types === "string") types = [types];

    /**
     * Check if the array values is of the given types.
     */
    return !arr.some((value) => {
        try {
            assertType(value, types);
            return false;
        } catch (e) {
            // Stop on first error.
            // This reduces the amount of checks.
            return true;
        }
    });
}
