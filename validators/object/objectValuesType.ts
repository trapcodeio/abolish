import type { AbolishValidator } from "../../src/types";
import { arrayIsTypeOf, assertType } from "../../src/types-checker";

export = <AbolishValidator>{
    name: "objectValuesType",
    error: ":param object values does not match the expected types",
    validator: (obj: any[], types: string | string[]) => {
        assertType(obj, "object", `[objectValues] object`);
        assertType(types, ["string", "array"], `[objectValues] types`);

        return arrayIsTypeOf(Object.values(obj), types);
    }
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            objectValuesType: string | string[];
        }
    }
}
