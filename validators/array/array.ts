import type { AbolishValidator } from "../../src/Types";
import { arrayIsTypeOf } from "../../src/types-checker";

export = <AbolishValidator>{
    name: "array",
    error: ":param is not a valid array!",
    validator(value: any[], option: boolean | string | string[], { error }) {
        // If option is false then we don't validate this
        if (option === false) return true;

        // Check if is an array
        if (!Array.isArray(value)) return false;

        //  if option is string or array of strings then we check
        //  if it is an array and the values are of the given types.
        if (typeof option === "string" || Array.isArray(option)) {
            return arrayIsTypeOf(value, option)
                ? true
                : error(`:param array values must be of type: [${option}]`);
        }

        return true;
    }
};
