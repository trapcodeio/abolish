import type { AbolishValidator } from "../../src/Types";
import { assertType } from "../../src/types-checker";

export = <AbolishValidator>{
    name: "inArray",
    validator: (value: any, option: any[] | ((v?: any) => any[] | true), { error }) => {
        assertType(option, ["array", "function"]);
        const err = error(`:param does not exists in the given array`);

        /**
         * if option is a function
         * we run the function and check if the result is in the array
         */
        if (typeof option === "function") {
            const result = option(value);

            if (typeof result === "boolean") return result ? true : err;
            else if (Array.isArray(result)) {
                option = result; // We replace the option with the result
            }
        }

        // Now we are sure that option is an array
        // we can loop through the array and check if the value is in the array
        for (let i = 0; i < option.length; i++) {
            if ((option as any)[i] === value) return true;
        }

        return err;
    }
};
