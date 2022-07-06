import type { AbolishValidator } from "../../src/Types";
import { assertType } from "../../src/types-checker";

export = <AbolishValidator>{
    name: "notInArray",
    error: ":param is not allowed",
    validator: (value: any, option: any[] | ((v?: any) => any[] | true), { error }) => {
        assertType(option, ["array", "function"]);

        /**
         * if option is a function
         * we run the function and check if the result is in the array
         */
        if (typeof option === "function") {
            const result = option(value);

            if (typeof result === "boolean") return result;
            else if (Array.isArray(result)) {
                option = result; // We replace the option with the result
            } else {
                throw new Error(
                    `The result of [notInArray] function must be a boolean or an array`
                );
            }
        }

        // Now we are sure that option is an array
        // we can loop through the array and check if the value is in the array
        for (let i = 0; i < option.length; i++) {
            if ((option as any)[i] === value) return false;
        }

        return true;
    }
};
