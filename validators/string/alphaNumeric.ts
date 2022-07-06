import type { AbolishValidator } from "../../src/types";

export = <AbolishValidator>{
    name: "alphaNumeric",
    error: ":param is not AlphaNumeric.",
    validator: (str: any) => new RegExp(/^[a-z0-9]+$/i).test(str)
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            alphaNumeric: boolean;
        }
    }
}
