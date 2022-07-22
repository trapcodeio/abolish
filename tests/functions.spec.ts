import test from "japa";
import { Schema, Rule } from "../src/functions";
import { skipIfNotDefined } from "../src/helpers";
import { Abolish } from "../index";
import { registerAllValidators } from "../src/ValidatorHelpers";
import { abolish_Omit } from "../src/inbuilt.fn";

test.group("Functions", (group) => {
    group.before(() => {
        registerAllValidators(Abolish);
    });

    test("Rule", (assert) => {
        const rule = Rule(["required", { min: 10, max: 20 }, "!exact"]);

        assert.deepEqual(rule, {
            required: true,
            min: 10,
            max: 20,
            exact: false
        });
    });

    test("abolish_Omit", (assert) => {
        const obj = {
            name: "Paul Smith",
            age: 20,
            email: "example@mail.com"
        };

        const omitted = abolish_Omit(obj, ["name", "email"]);
        assert.deepEqual(omitted, { age: 20 });
    });

    test("multiple times", () => {
        const stringRequired = Rule([
            "required|typeof:string|string:trim",
            { $errors: { typeof: ":param expects a string!" } }
        ]);

        const rules = { stringRequired };

        const rule = Schema({
            $: "required",
            description: skipIfNotDefined(["$name:Desc", rules.stringRequired]),
            url: ["required|typeof:string", { url: true }],
            // as any used here because abolish needs a fix.
            settings: skipIfNotDefined({
                object: { includeData: skipIfNotDefined("boolean") }
            } as any)
        });

        let count = 5;
        while (count--) {
            const [e] = Abolish.validate({ url: "http://localhost:2222/webhook/1" }, rule);
            if (e) throw new Error(e.message);
        }
    });
});
