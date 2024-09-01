import type { AbolishValidator } from "../../src/types";

export = <AbolishValidator>{
    name: "lt",
    error: ":param must be less than :option",
    validator: (param, option: number, { modifier }) => {
        return Number(param) < option
    }
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            lt: number;
        }
    }
}
