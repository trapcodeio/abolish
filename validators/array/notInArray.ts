import type { AbolishValidator } from "../../src/types";
import { assertType } from "../../src/types-checker";

type notInArrayOption = any[] | ((v?: any) => any[] | true);
export = <AbolishValidator>{
    name: "notInArray",
    error: ":param is not allowed",
    description: "Check that a value is not in an array",
    validator: (value: any, option: notInArrayOption) => {
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

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            notInArray: notInArrayOption;
        }
    }
}
