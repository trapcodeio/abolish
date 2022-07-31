import type { AbolishRule, AbolishValidator } from "../../src/types";
import { Rule } from "../../src/functions";
import { assertType } from "../../src/types-checker";
import type { AbolishCompiled } from "../../src/Compiler";

export = <AbolishValidator>{
    name: "arrayValues",
    error: ":param array values does not match the expected types",
    validator: (arr: any[], rule: AbolishRule, { error, abolish, modifier }) => {
        assertType(arr, "array", `[arrayValues] value`);
        assertType(rule, ["string", "array", "object"], `[arrayValues] rule`);

        if (typeof rule === "string" || Array.isArray(rule)) {
            rule = Rule(rule);
        }

        // loop through the array and check if the values are of the given types
        // using abolish
        const newArray = [] as any[];

        for (let i in arr) {
            const result = abolish.check(arr[i], rule);
            if (result[0]) return error(result[0].message, result[0]).setCode(`index|${i}`);
            newArray.push(result[1]);
        }

        modifier.setThis(newArray);
    }
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            arrayValues: AbolishRule | AbolishCompiled;
        }
    }
}
