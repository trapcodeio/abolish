import type { AbolishValidator } from "../../src/types";
import { InstanceOf } from "../../src/inbuilt.fn";

export = <AbolishValidator>{
    name: "date",
    validator: (v, o: "cast" | { cast: true }, { modifier }) => {
        if (InstanceOf(Date, v)) {
            return true;
        } else if (typeof v === "string") {
            const date = new Date(v);
            const isDate = !isNaN(date.getTime());

            if (
                isDate &&
                ((typeof o === "string" && o === "cast") || (typeof o === "object" && o?.cast))
            ) {
                modifier.setThis(date);
            }

            return isDate;
        } else {
            return false;
        }
    },
    error: `:param is not a valid Date!`
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            date: "cast" | { cast: true };
        }
    }
}
