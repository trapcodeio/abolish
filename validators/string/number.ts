import type { AbolishValidator } from "../../src/types";

export = <AbolishValidator>{
    name: "number",
    error: ":param is not a valid number",
    /**
     *
     * @param number
     * @param option
     * @param {ObjectModifier} modifier
     * @return {boolean}
     */
    validator: (number, option, { modifier }) => {
        const isNumber = !isNaN(number);

        // Cast to number if not number
        if (modifier && isNumber && typeof number !== "number") {
            modifier.setThis(Number(number));
        }

        return isNumber;
    }
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            number: true;
        }
    }
}
