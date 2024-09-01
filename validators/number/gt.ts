import type { AbolishValidator } from "../../src/types";

export = <AbolishValidator>{
    name: "gt",
    error: ":param must be greater than :option",
    validator: (param, option: number, { modifier }) => {
        return Number(param) > option
    }
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            gt: number;
        }
    }
}
