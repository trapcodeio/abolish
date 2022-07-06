import type { AbolishValidator } from "../../src/types";

export = <AbolishValidator>{
    name: "same",
    error: ":param must be the same as :option",
    validator: (v, o, { modifier }) => {
        return v === modifier.get(o);
    }
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            same: string;
        }
    }
}
