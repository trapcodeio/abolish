import type { AbolishValidator } from "../../src/types";

export = <AbolishValidator>{
    name: "jsonEncode",
    error: ":param is not a valid JSON string",
    /**
     * @param str
     * @param option
     * @param {ObjectModifier} modifier
     */
    validator: (str, option, { modifier }) => {
        modifier.setThis(JSON.stringify(str));
    }
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            jsonEncode: true;
        }
    }
}
