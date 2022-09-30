import type { AbolishValidator } from "../../src/types";
import { assertType } from "../../src/types-checker";

type inArrayOption = any[] | ((v?: any) => any[] | true);

export = <AbolishValidator>{
    name: "inArray",
    description: "Check that a value is in an array",
    error: ":param does not exists in array [:option]",
    validator: (value: any, option: inArrayOption) => {
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
            }
        }

        // Now we are sure that option is an array
        // we can loop through the array and check if the value is in the array
        for (let i = 0; i < option.length; i++) {
            if ((option as any)[i] === value) return true;
        }

        return false;
    }
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            inArray: inArrayOption;
        }
    }
}
