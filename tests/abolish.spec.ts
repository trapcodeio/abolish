/**
 * This file includes test to show that all methods of the Abolish class
 * are working correctly.
 */

import test from "japa";
import { Abolish } from "../index";
import StringValidators from "../validators/string";

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
        Abolish.addGlobalValidators(StringValidators);
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
            age: "required|typeof:number|min:18",
            email: "required|email"
        });

        // Validation should pass
        assert.isUndefined(e);

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
            age: "required|typeof:number|min:18",
            email: "required|email"
        });

        // Validation should pass
        assert.isUndefined(e);

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
        const [e, age] = Abolish.check(20, "required|typeof:number|min:18");

        // Validation should pass
        assert.isUndefined(e);

        // Age should be 20
        assert.equal(age, 20);

        // fail validation
        const [e2, age2] = Abolish.check(17, "required|typeof:number|min:18");

        // Validation should fail
        assert.isNotFalse(e2);

        // has validation error keys
        assert.hasAllKeys(e2, ["data", "key", "message", "validator", "type", "code"]);

        // Age should be undefined
        assert.isUndefined(age2);
    });

    test("checkAsync", async (assert) => {
        const [e, age] = await Abolish.checkAsync(20, "required|typeof:number|min:18");

        // Validation should pass
        assert.isUndefined(e);

        // Age should be 20
        assert.equal(age, 20);

        // fail validation
        const [e2, age2] = await Abolish.checkAsync(17, "required|typeof:number|min:18");

        // Validation should fail
        assert.isNotFalse(e2);

        // has validation error keys
        assert.hasAllKeys(e2, ["data", "key", "message", "validator", "type", "code"]);

        // Age should be undefined
        assert.isUndefined(age2);
    });

    test("attempt", (assert) => {
        // Add Email validator
        Abolish.addGlobalValidator(StringValidators.email);

        let age;
        try {
            age = Abolish.attempt(17, "required|typeof:number|min:18");
        } catch (e: any) {}

        // Validation failed
        assert.isUndefined(age);

        // Validation should pass
        const email = Abolish.attempt("ADMIN@example.com", "required|email:lowercase");

        // Validation passed
        assert.equal(email, "admin@example.com");
    });

    test("attemptAsync", async (assert) => {
        // Add Email validator
        Abolish.addGlobalValidator(StringValidators.email);

        let age;
        try {
            age = await Abolish.attemptAsync(17, "required|typeof:number|min:18");
        } catch (e: any) {}

        // Validation failed
        assert.isUndefined(age);

        // Validation should pass
        const email = await Abolish.attemptAsync("ADMIN@example.com", "required|email:lowercase");

        // Validation passed
        assert.equal(email, "admin@example.com");
    });

    test("test", (assert) => {
        // Add Email validator
        Abolish.addGlobalValidator(StringValidators.email);

        // Pass validation
        const isValidMail = Abolish.test("ADMIN@example.com", "required|email");

        // Validation passed
        assert.isTrue(isValidMail);

        // Fail validation
        const isValidMail2 = Abolish.test("not a mail", "required|email");

        // Validation failed
        assert.isFalse(isValidMail2);
    });

    test("testAsync", async (assert) => {
        // Add Email validator
        Abolish.addGlobalValidator(StringValidators.email);

        // Pass validation
        const isValidMail = await Abolish.testAsync(
            "ADMIN@example.com",
            "required|email:lowercase"
        );

        // Validation passed
        assert.isTrue(isValidMail);

        // Fail validation
        const isValidMail2 = await Abolish.testAsync("not a mail", "required|email:lowercase");

        // Validation failed
        assert.isFalse(isValidMail2);
    });
});

test.group("Instance Methods", (group) => {
    let abolish: Abolish;

    /**
     * Since static methods calls instance methods,
     * There will be no need to create tests for them.
     */

    group.before(() => {
        abolish = new Abolish();
    });

    test("addValidator", (assert) => {
        abolish.addValidator(StringValidators.url);

        // Check if validator is added
        assert.hasAnyKeys(abolish.validators, ["url"]);

        // Use validator
        const [e, url] = abolish.check("https://example.com", "url");

        // Validation should pass
        assert.isUndefined(e);

        // Url should be https://example.com
        assert.equal(url, "https://example.com");
    });
});
