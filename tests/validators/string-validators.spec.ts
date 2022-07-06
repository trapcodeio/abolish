/**
 * Test all string validators
 */

import { Abolish } from "../../index";
import { registerValidators } from "../../src/ValidatorHelpers";
import test from "japa";

test.group("String Validators", (group) => {
    group.before(() => {
        registerValidators(Abolish, "string");
    });

    test("alphaNumeric", (assert) => {
        assert.isFalse(Abolish.test("Hello 2022!", "alphaNumeric"));
        // => false

        assert.isTrue(Abolish.test("hello2022", "alphaNumeric"));
        // => true
    });

    test("boolean", (assert) => {
        assert.isTrue(Abolish.test(true, "boolean"));
        assert.isTrue(Abolish.test(false, "boolean"));

        // 1 will be converted to true
        assert.isTrue(Abolish.test(1, "boolean"));
        // 0 will be converted to false
        assert.isTrue(Abolish.test(0, "boolean"));

        // `true` will be converted to true
        assert.isTrue(Abolish.test("true", "boolean"));
        // `false` will be converted to false
        assert.isTrue(Abolish.test("false", "boolean"));
    });

    test("date", (assert) => {
        const date = Abolish.attempt("2020-01-01", "date");
        // Validation passed
        // date === "2020-01-01"
        assert.equal(date, "2020-01-01");

        // Cast to date
        const date2 = Abolish.attempt("2020-01-01", "date:cast");
        // Validation passed
        // date instanceof Date
        // date === new Date("2020-01-01")
        assert.instanceOf(date2, Date);
    });

    test("email", (assert) => {
        assert.isFalse(Abolish.test("hello", "email"));
        assert.isTrue(Abolish.test("json@email.com", "email"));
    });

    test("ipAddress", () => {
        // validate ipv4
        Abolish.attempt("69.89.31.226", "ipAddress"); // => true
        // validate ipv6
        Abolish.attempt("2002:4559:1FE2::4559:1FE2", "ipAddress"); // => true
    });

    test("json", (assert) => {
        assert.isTrue(Abolish.test("{}", "json")); // => true
        assert.isTrue(Abolish.test("[1,2,3]", "json")); // => true
        assert.isFalse(Abolish.test("[1,2,3,,,,]", "json")); // => false
    });

    test("jsonDecode", (assert) => {
        const decoded = Abolish.attempt<string | object>("[1,2,3]", "json|jsonDecode");
        // we put `json` in front of `jsonDecode` to check if the value is valid JSON first.
        // decoded === [1,2,3]
        assert.deepEqual(decoded, [1, 2, 3]);

        // Note: In object using validate/validateAsync,
        // Decoded values can also be validated after decoding. for example:

        const json = JSON.stringify({
            city: "New York",
            country: "USA"
        });

        Abolish.attempt(json, [
            "json|jsonDecode",
            // This will validate the decoded value
            // because it was called after `json|jsonDecode`
            {
                object: {
                    city: "required|string",
                    country: "required|string"
                }
            }
        ]);
    });

    test("jsonEncode", (assert) => {
        const json = Abolish.attempt<string | object>(
            {
                city: "New York",
                country: "USA"
            },
            "jsonEncode"
        );

        // json === '{"city":"New York","country":"USA"}'
        assert.equal(json, '{"city":"New York","country":"USA"}');
    });

    test("md5", (assert) => {
        // Wrap with assert
        assert.isFalse(Abolish.test("hello", "md5")); // => false
        assert.isTrue(Abolish.test("d4f3a1c8c9f9e1816dd6c3d3d5aaf0bf", "md5")); // => true
    });

    test("number", (assert) => {
        // Wrap with assert
        assert.isFalse(Abolish.test("hello", "number")); // => false
        assert.isTrue(Abolish.test(1, "number")); // => true
        assert.isNumber(Abolish.attempt("1", "number")); // => 1
        assert.isFalse(Abolish.test("1a", "number")); // => false
    });

    test("regex", (assert) => {
        // Wrap with assert
        assert.isFalse(Abolish.test("Hello", { regex: /^hello$/ })); // => false
        assert.isTrue(Abolish.test("hello", { regex: /^hello$/i })); // => true
    });

    test("string", (assert) => {
        // Wrap with assert
        assert.isFalse(Abolish.test(1, "string")); // => false
        assert.isTrue(Abolish.test("hello", "string")); // => true

        const str = Abolish.attempt("  Hello  ", "string:trim");
        // Result: str === "Hello"
        assert.equal(str, "Hello");

        // Using the chain method
        const str2 = Abolish.attempt("  Hello  ", "string:trim,toLowerCase"); // chain method
        // Result: str2 === "hello"
        assert.equal(str2, "hello");

        // Any `String` method that does not require arguments can be chained
        const str3 = Abolish.attempt("Cat", "string:trim,toLowerCase,bold,big");
        // Result: str === "<big><b>Cat</b></big>"
        assert.equal(str3, "<big><b>cat</b></big>");
    });

    test("url", (assert) => {
        // Wrap with assert
        assert.isFalse(Abolish.test("hello", "url")); // => false
        assert.isTrue(Abolish.test("https://google.com", "url")); // => true
    });

    test("url: allowed hostnames", (assert) => {
        assert.isTrue(
            Abolish.test("https://google.com", {
                url: { allowedHostnames: ["google.com"] }
            })
        );

        assert.isFalse(
            Abolish.test("https://facebook.com", {
                url: { allowedHostnames: ["google.com"] }
            })
        );
    });

    test("url: deny hostnames", (assert) => {
        assert.isTrue(
            Abolish.test("https://google.com", {
                url: { blockedHostnames: ["facebook.com"] }
            })
        );

        assert.isFalse(
            Abolish.test("https://facebook.com", {
                url: { blockedHostnames: ["facebook.com"] }
            })
        );
    });
});
