/**
 * Test all array validators
 */

import test from "japa";
import Abolish from "../../src/Abolish";
import { registerValidators } from "../../src/ValidatorHelpers";

test.group("Array Validators", (group) => {
    group.before(() => {
        registerValidators(Abolish, "array");
    });

    test("any", (assert) => {
        const role = "user";
        // Wrap with assert
        assert.isFalse(Abolish.test(role, { any: ["staff", "admin"] })); // => false
        assert.isTrue(Abolish.test(role, { any: ["user", "subscriber"] })); // => true
    });

    test("array", (assert) => {
        const roles = ["user", "staff"];
        assert.isTrue(Abolish.test(roles, "array")); // => true
        assert.isFalse(Abolish.test("user", "array")); // => false
    });

    test("array size Passed", (assert) => {
        const roles = ["user", "staff"];
        assert.isTrue(Abolish.test(roles, { array: 2 })); // => true
    });

    test.failing("array size Failed", () => {
        const roles = ["user", "staff"];
        Abolish.attempt(roles, { array: 3, $name: "Roles" }); // => false
    });

    test("array type Passed", (assert) => {
        assert.isTrue(Abolish.test([1, 2, 3], { array: "number" }));
        assert.isFalse(Abolish.test([1, "2", 3], { array: ["number"] }));
        assert.isTrue(Abolish.test([1, "2", 3], { array: ["string", "number"] }));
        assert.isFalse(Abolish.test([1, "2", 3, {}], { array: ["string", "number"] }));
    });

    test("arrayValues", (assert) => {
        const data = [
            { id: 1, name: "John" },
            { id: 2, name: "Jane" },
            { id: 3, name: "Jack" }
        ];

        const value = Abolish.attempt(data, {
            array: 3,
            arrayValues: {
                object: {
                    id: "typeof:number",
                    name: "typeof:string"
                }
            }
        });

        assert.deepEqual(value, data);
    });
});
