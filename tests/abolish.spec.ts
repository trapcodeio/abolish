/**
 * This file includes test to show that all methods of the Abolish class
 * are working correctly.
 */

import test from "japa";
import { Abolish } from "../index";

test.group("Static Methods", () => {
    test("getGlobalValidators", (assert) => {
        const GlobalValidators =
            require("../src/GlobalValidators") as typeof import("../src/GlobalValidators");

        assert.deepEqual(Abolish.getGlobalValidators(), GlobalValidators);
    });

    test("addGlobalValidator", (assert) => {
        Abolish.addGlobalValidator({
            name: "test",
            validator: (value: any) => value,
            error: `Test validator error`
        });

        assert.include(Abolish.getGlobalValidatorsList(), "test");

        assert.isTrue(Abolish.test(true, "test"));
        assert.isFalse(Abolish.test(false, "test"));
    });

    test("addGlobalValidators", (assert) => {
        const stringValidators = require("../validators/string");
        Abolish.addGlobalValidators(stringValidators);

        // check if the string `ipAddress` is in the list of validators
        assert.include(Abolish.getGlobalValidatorsList(), "ipAddress");
    });

    test("validate", (assert) => {
        const data = {
            name: "Paul Smith",
            age: 20,
            email: "paul@example.com"
        };

        const [e, v] = Abolish.validate(data, {
            age: "required|number|min:18",
            email: "required|email"
        });

        // Validation should pass
        assert.isFalse(e);

        // validation data should not be the same as the original data
        // because only `age` and `email` keys are validated
        assert.notDeepEqual(v, data);

        // Returned data should only contain `age` and `email` keys
        assert.deepEqual(v, {
            age: 20,
            email: "paul@example.com"
        });
    });

    test("validate async", async (assert) => {
        const data = {
            name: "Paul Smith",
            age: 20,
            email: "paul@example.com"
        };

        const [e, v] = await Abolish.validateAsync(data, {
            age: "required|number|min:18",
            email: "required|email"
        });

        // Validation should pass
        assert.isFalse(e);

        // validation data should not be the same as the original data
        // because only `age` and `email` keys are validated
        assert.notDeepEqual(v, data);

        // Returned data should only contain `age` and `email` keys
        assert.deepEqual(v, {
            age: 20,
            email: "paul@example.com"
        });
    });

    test("check", (assert) => {
        const [e, age] = Abolish.check(20, "required|number|min:18");

        // Validation should pass
        assert.isFalse(e);

        // Age should be 20
        assert.equal(age, 20);

        // fail validation
        const [e2, age2] = Abolish.check(17, "required|number|min:18");

        // Validation should fail
        assert.isNotFalse(e2);

        // has validation error keys
        assert.hasAllKeys(e2, ["data", "key", "message", "validator", "type"]);

        // Age should be undefined
        assert.isUndefined(age2);
    });

    test("checkAsync", async (assert) => {
        const [e, age] = await Abolish.checkAsync(20, "required|number|min:18");

        // Validation should pass
        assert.isFalse(e);

        // Age should be 20
        assert.equal(age, 20);

        // fail validation
        const [e2, age2] = await Abolish.checkAsync(17, "required|number|min:18");

        // Validation should fail
        assert.isNotFalse(e2);

        // has validation error keys
        assert.hasAllKeys(e2, ["data", "key", "message", "validator", "type"]);

        // Age should be undefined
        assert.isUndefined(age2);
    });

    // test("attempt", (assert) => {});
    // test("attemptAsync", (assert) => {});
    //
    // test("test", (assert) => {});
    // test("testAsync", (assert) => {});
});
