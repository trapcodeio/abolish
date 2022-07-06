import type { AbolishAsyncValidator, AbolishRule } from "../../src/types";
import { Rule } from "../../src/functions";
import { assertType } from "../../src/types-checker";

export = <AbolishAsyncValidator>{
    name: "arrayValuesAsync",
    isAsync: true,
    error: ":param array values does not match the expected types",
    validator: async (arr: any[], rule: AbolishRule, { error, abolish, modifier }) => {
        assertType(arr, "array", `arrayValuesAsync values`);
        assertType(rule, ["string", "array", "object"]);

        if (typeof rule === "string" || Array.isArray(rule)) {
            rule = Rule(rule);
        }

        // loop through the array and check if the values are of the given types
        // using abolish
        const newArray = [] as any[];
        for (let i = 0; i < arr.length; i++) {
            const [err, validated] = await abolish.checkAsync(arr[i], {
                $name: `arrayValues[${i}]`,
                ...(rule as Record<string, any>)
            });
            if (err) return error(err.message, err);
            newArray.push(validated);
        }

        modifier.setThis(newArray);
    }
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            arrayValuesAsync: AbolishRule;
        }
    }
}
