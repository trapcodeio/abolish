import type { AbolishValidator } from "../../src/types";

export = <AbolishValidator>{
    name: "regex",
    error: ":param failed Regex validation.",
    validator: (str, regex) => {
        const isRegex = regex instanceof RegExp;
        if (typeof str !== "string") return false;

        if (isRegex) {
            return regex.test(str);
        } else {
            return new RegExp(regex).test(str);
        }
    }
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            regex: string | RegExp;
        }
    }
}
