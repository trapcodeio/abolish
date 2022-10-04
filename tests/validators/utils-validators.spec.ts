/**
 * Test all util validators
 */

import test from "japa";
import Abolish from "../../src/Abolish";
import { registerValidators } from "../../src/ValidatorHelpers";
import StringValidator from "../../validators/string/string";

test.group("Utils Validators", (group) => {
    group.before(() => {
        registerValidators(Abolish, "utils");
        Abolish.addGlobalValidator(StringValidator);
    });

    test.failing("same", () => {
        const form = {
            password: "hello",
            confirmPassword: "hello!"
        };

        Abolish.attempt(form, {
            object: {
                password: "required|string",
                confirmPassword: "required|string|same:password"
            }
        }); // false

        // Error: Confirm Password must be the same as password.
    });

    // test.only("same compiled", () => {
    //     const schema = Abolish.compileObject({
    //         password: "required|string",
    //         confirmPassword: "required|string|same:password"
    //     });
    //
    //     schema.validateObject({
    //         password: "hello",
    //         confirmPassword: "hello"
    //     });
    //
    //     schema.validateObject({
    //         password: "web",
    //         confirmPassword: "web"
    //     });
    //
    //     // Error: Confirm Password must be the same as password.
    // });
});
