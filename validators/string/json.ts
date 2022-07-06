import type { AbolishValidator } from "../../src/types";

export = <AbolishValidator>{
    name: "json",
    error: ":param is not a valid JSON string",
    validator: (str) => {
        if (typeof str !== "string") return false;
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            json: true;
        }
    }
}
