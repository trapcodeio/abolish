import type { AbolishAsyncValidator, AbolishRule } from "../../src/types";
import { Rule } from "../../src/functions";
import { assertType } from "../../src/types-checker";
import type { AbolishCompiled } from "../../src/Compiler";

export = <AbolishAsyncValidator>{
    name: "objectValuesAsync",
    error: ":param object values does not match the expected types",
    isAsync: true,
    validator: async (obj: Record<any, any>, rule: AbolishRule, { error, abolish }) => {
        assertType(obj, "object", `[objectValuesAsync] value`);
        assertType(rule, ["string", "array", "object"], `[objectValuesAsync] rule`);

        if (typeof rule === "string" || Array.isArray(rule)) {
            rule = Rule(rule);
        }

        // loop through the object and check if the values are of the given types
        // using abolish
        for (let key in obj) {
            const result = await abolish.checkAsync(obj[key], rule);
            if (result[0]) return error(result[0].message, result[0]).setCode(`key|${key}`);
            obj[key] = result[1];
        }
    }
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            objectValuesAsync: AbolishRule | AbolishCompiled;
        }
    }
}
