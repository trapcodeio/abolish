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

    test.failing("any", () => {
        Abolish.attempt("user", { any: ["staff", "admin"] });
    });

    test("inArray", (assert) => {
        const role = "user";
        assert.isFalse(Abolish.test(role, { inArray: ["staff", "admin"] })); // => false
        assert.isTrue(Abolish.test(role, { inArray: ["user", "subscriber"] })); // => true

        // Use function to get the array
        assert.isTrue(Abolish.test("staff", { inArray: () => ["staff", "admin", "user"] })); // => true
        assert.isFalse(Abolish.test(3, { inArray: () => [0, 1, 2] })); // => false

        // Use function to determine if the value is in the array
        assert.isTrue(
            Abolish.test("staff", {
                inArray: (v: string) => ["staff", "admin", "user"].includes(v)
            })
        ); // => true

        // Or something more complex
        type User = { name: string; role: string };
        const users: User[] = [
            // random list of users
            { name: "John", role: "admin" },
            { name: "Jane", role: "staff" },
            { name: "Sam", role: "user" }
        ];

        assert.isTrue(
            Abolish.test(users[1], {
                inArray: (v: User) => users.some((user) => user.name === v.name)
            })
        ); // => true
    });

    test("notInArray", (assert) => {
        const roles = ["user", "staff"];
        assert.isTrue(Abolish.test("admin", { notInArray: roles })); // => true
        assert.isFalse(Abolish.test("user", { notInArray: roles })); // => false

        // Use function to get the array
        assert.isTrue(Abolish.test("admin", { notInArray: () => roles })); // => false
        assert.isFalse(Abolish.test("user", { notInArray: () => roles })); // => true

        // Use function to determine if the value is not in the array
        assert.isTrue(
            Abolish.test("admin", {
                notInArray: (v: string) => !roles.includes(v)
            })
        ); // => true

        // Or something more complex
        type User = { name: string; role: string };
        const users: User[] = [
            // random list of users
            { name: "John", role: "admin" },
            { name: "Jane", role: "staff" },
            { name: "Sam", role: "user" }
        ];

        assert.isTrue(
            Abolish.test(
                { name: "John1", role: "admin3" },
                { notInArray: (v: User) => !users.some((user) => user.name === v.name) }
            )
        ); // => true

        assert.isFalse(
            Abolish.test(users[1], {
                notInArray: (v: User) => !users.some((user) => user.name === v.name)
            })
        ); // => false
    });

    test("array", (assert) => {
        const roles = ["user", "staff"];
        assert.isTrue(Abolish.test(roles, "array")); // => true
        assert.isFalse(Abolish.test("user", "array")); // => false
    });

    test("array with type", (assert) => {
        assert.isTrue(Abolish.test([1, 2, 3], { array: "number" }));
        assert.isFalse(Abolish.test([1, "hello", 3], { array: ["number"] }));
        assert.isTrue(Abolish.test([1, "hello", 3], { array: ["string", "number"] }));
        assert.isFalse(Abolish.test([1, "hello", 3, {}], { array: ["string", "number"] }));
    });

    test("arraySize Passed", (assert) => {
        const roles = ["user", "staff"];
        assert.isTrue(Abolish.test(roles, { arraySize: 2 })); // => true
    });

    test.failing("arraySize Failed", () => {
        const roles = ["user", "staff"];
        Abolish.attempt(roles, { arraySize: 3, $name: "Roles" }); // => false
    });

    test("arrayValues", (assert) => {
        assert.isTrue(
            Abolish.test(["USA", "CAN"], {
                arrayValues: "typeof:string|size:3"
            })
        ); // => true

        const data = [
            { id: 1, name: "John" },
            { id: 2, name: "Jane" },
            { id: 3, name: "Jack" }
        ];

        const value = Abolish.attempt(data, {
            arraySize: 3,
            arrayValues: {
                object: {
                    id: "typeof:number",
                    name: "typeof:string"
                }
            }
        });

        assert.deepEqual(value, data);
    });

    test("arrayValuesAsync", async (assert) => {
        const data = [
            { id: 1, name: "John" },
            { id: 2, name: "Jane" },
            { id: 3, name: "Jack" }
        ];

        const value = await Abolish.attemptAsync(data, {
            arraySize: 3,
            arrayValuesAsync: {
                object: {
                    id: "typeof:number",
                    name: "typeof:string"
                }
            }
        });

        assert.deepEqual(value, data);
    });
});
