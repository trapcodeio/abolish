/**
 * Test all array validators
 */

import test from "japa";
import Abolish from "../../src/Abolish";
import { registerValidators } from "../../src/ValidatorHelpers";

test.group("Array Validators", (group) => {
    group.beforeEach(() => {
        registerValidators(Abolish, "array");
    });

    test("any", (assert) => {
        const role = "user";
        // Wrap with assert
        assert.isFalse(Abolish.test(role, { any: ["staff", "admin"] })); // => false
        assert.isTrue(Abolish.test(role, { any: ["user", "subscriber"] })); // => true
    });
});
