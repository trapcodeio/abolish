import test from "japa";
import { Abolish } from "../../index";
import { $inline } from "../../src/helpers";

test.group("Default Validators", () => {
    test("default", (assert) => {
        // Set default value
        const firstName = Abolish.attempt(undefined, { default: "Joe" });
        // name === 'Joe'
        assert.equal(firstName, "Joe");

        // Use original value
        const lastName = Abolish.attempt("Sam", { default: "Doe" });
        // name === 'Sam'
        assert.equal(lastName, "Sam");
    });

    test("required", (assert) => {
        // undefined is false
        assert.isFalse(Abolish.test(undefined, "required"));

        // null is false
        assert.isFalse(Abolish.test(null, "required"));

        // empty string is false
        assert.isFalse(Abolish.test("", "required"));

        // empty array is false
        assert.isFalse(Abolish.test([], "required"));

        // 0 or any number is true
        assert.isTrue(Abolish.test(0, "required"));

        // Dont validated if required is false
        assert.isTrue(Abolish.test(undefined, "!required"));
    });

    test("typeof", (assert) => {
        // Passes
        // Test String
        assert.isTrue(Abolish.test("", "typeof:string"));

        // Test Number
        assert.isTrue(Abolish.test(0, "typeof:number"));

        // Test Boolean
        assert.isTrue(Abolish.test(true, "typeof:boolean"));

        // Test Array
        assert.isTrue(Abolish.test([], "typeof:array"));

        // Test Object
        assert.isTrue(Abolish.test([], "typeof:object"));
        assert.isTrue(Abolish.test({}, "typeof:object"));
        assert.isTrue(Abolish.test(() => {}, "typeof:function"));

        // Test Function
        assert.isTrue(Abolish.test(() => {}, "typeof:function"));

        // Fails
        // Test String
        assert.isFalse(Abolish.test(0, "typeof:string"));

        // Test Number
        assert.isFalse(Abolish.test("", "typeof:number"));

        // Test Boolean
        assert.isFalse(Abolish.test(undefined, "typeof:boolean"));

        // Test Array
        assert.isFalse(Abolish.test(0, "typeof:array"));
        assert.isFalse(Abolish.test("", "typeof:array"));
        assert.isFalse(Abolish.test({}, "typeof:array"));

        // Test Object
        assert.isFalse(Abolish.test("", "typeof:object"));

        // Test Function
        assert.isFalse(Abolish.test(0, "typeof:function"));
    });

    test("exact", (assert) => {
        // Passes
        assert.isTrue(Abolish.test("hello", { exact: "hello" }));
        assert.isTrue(Abolish.test(0, { exact: 0 }));
        assert.isTrue(Abolish.test(true, { exact: true }));
        assert.isTrue(Abolish.test(false, { exact: false }));

        // Fails
        assert.isFalse(Abolish.test("hello", { exact: "world" }));
        assert.isFalse(Abolish.test(0, { exact: 1 }));
        assert.isFalse(Abolish.test(true, { exact: false }));
        assert.isFalse(Abolish.test(false, { exact: true }));
    });

    test("min", (assert) => {
        // Passes
        assert.isTrue(Abolish.test(18, { min: 18 }));

        // Fails
        assert.isFalse(Abolish.test(17, { min: 18 }));
    });

    test("max", (assert) => {
        // Passes
        assert.isTrue(Abolish.test(18, { max: 18 }));

        // Fails
        assert.isFalse(Abolish.test(19, { max: 18 }));
    });

    test("minLength", (assert) => {
        // Passes
        assert.isTrue(Abolish.test("hello", { minLength: 5 }));

        // Fails
        assert.isFalse(Abolish.test("hello", { minLength: 6 }));
    });

    test("maxLength", (assert) => {
        // Passes
        assert.isTrue(Abolish.test("hello", { maxLength: 5 }));

        // Fails
        assert.isFalse(Abolish.test("hello", { maxLength: 4 }));
    });

    test("object", (assert) => {
        const rule = {
            name: "required|typeof:string",
            age: "required|typeof:number|min:18"
        };

        // Passes
        const [e, v] = Abolish.check(
            {
                name: "Sam",
                age: 18,
                isCool: true
            },
            { object: rule }
        );

        // Error is false
        assert.isFalse(e);

        // validated object
        assert.deepEqual(v, {
            name: "Sam",
            age: 18
        } as any);

        // Fails
        const [e2, v2] = Abolish.check<any>(
            {
                name: "Sam",
                age: 17,
                isCool: true
            },
            {
                object: rule
            }
        );

        // Error is true
        assert.isDefined(e2);

        // validated object is undefined
        assert.deepEqual(v2, undefined);

        if (e2) {
            assert.equal(e2.validator, "object");
            // Check object error validator
            assert.equal(e2.data.key, "age");
            assert.equal(e2.data.validator, "min");
        }
    });

    test("objectAsync", async (assert) => {
        const rule = {
            name: "required|typeof:string",
            age: "required|typeof:number|min:18"
        };

        // Passes
        const [e, v] = await Abolish.checkAsync(
            {
                name: "Sam",
                age: 18,
                isCool: true
            },
            { object: rule }
        );

        // Error is false
        assert.isFalse(e);

        // validated object
        assert.deepEqual(v, {
            name: "Sam",
            age: 18
        } as any);

        // Fails
        const [e2, v2] = await Abolish.checkAsync<any>(
            {
                name: "Sam",
                age: 17,
                isCool: true
            },
            {
                object: rule
            }
        );

        // Error is true
        assert.isDefined(e2);

        // validated object is undefined
        assert.deepEqual(v2, undefined);

        if (e2) {
            assert.equal(e2.validator, "object");
            // Check object error validator
            assert.equal(e2.data.key, "age");
            assert.equal(e2.data.validator, "min");
        }
    });

    test.failing("$inline", () => {
        Abolish.attempt("password", {
            $name: "Password",
            ...$inline((password) => password === "123456", ":param must be 123456")
        });
    });
});
