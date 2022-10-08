/**
 * Test all util validators
 */
import test from "japa";
import Abolish from "../../src/Abolish";
import { registerValidators } from "../../src/ValidatorHelpers";
import StringValidator from "../../validators/string/string";

test.group("Object Validators", (group) => {
    group.before(() => {
        registerValidators(Abolish, "object");
        Abolish.addGlobalValidator(StringValidator);
    });

    test("objectValues", (assert) => {
        const form = {
            password: "hello",
            confirmPassword: "hello!"
        };

        assert.isTrue(Abolish.test(form, { objectValues: "string|minLength:3" }));
    });

    test("objectValuesAsync", async (assert) => {
        const form = {
            password: "hello",
            confirmPassword: "hello!"
        };

        const isValid = await Abolish.testAsync(form, {
            objectValuesAsync: "string|minLength:3"
        });

        assert.isTrue(isValid);
    });

    test("objectValuesType", (assert) => {
        const data: Record<string, any> = {
            bitcoin: true,
            ethereum: true,
            ripple: true
        };

        assert.isTrue(
            Abolish.test(data, {
                typeof: "object",
                objectValuesType: "boolean"
            })
        );

        // fail
        data.bitcoin = 1;

        assert.isFalse(
            Abolish.test(data, {
                typeof: "object",
                objectValuesType: ["boolean"]
            })
        );

        // multiple types
        assert.isTrue(
            Abolish.test(data, {
                typeof: "object",
                objectValuesType: ["boolean", "number"]
            })
        );
    });
});
