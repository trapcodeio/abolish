import test from "japa";
import { $yup, $yupAsync, useYup } from "../../others/yup";
import { Abolish } from "../../index";
import * as Yup from "yup";
import { RuleTyped } from "../../src/functions";

test.group("Yup: Setup", () => {
    test("Use Yup", (assert) => {
        // Register Yup
        useYup(Abolish);

        // Validators
        const validators = Abolish.getGlobalValidators();

        // $yup
        assert.include(Object.keys(validators), "$yup");

        // Test with instance
        const abolish = new Abolish();

        useYup(abolish);

        assert.include(Object.keys(abolish.validators), "$yup");
    });
});

test.group("Yup: Usage", (group) => {
    group.before(() => {
        // Register Yup
        useYup(Abolish);
    });

    test("Validate", () => {
        // Assert
        Abolish.attempt(
            "email@example.com",
            RuleTyped({
                $yup: Yup.string().email()
            })
        );
    });

    test("Validate with helper", () => {
        // Assert
        Abolish.attempt("email@example.com", $yup(Yup.string().email()));
    });

    test("Validate with helpers function", () => {
        // Assert
        Abolish.attempt(
            "email@example.com",
            $yup((yup) => yup.string().email())
        );
    });

    /**
     * =============================================================
     * ========== TEST: ASYNC VALIDATION =========
     * =============================================================
     */

    test("Validate Async", async () => {
        // Assert
        await Abolish.attemptAsync(
            "email@example.com",
            RuleTyped({
                $yupAsync: {
                    schema: Yup.string().email()
                }
            })
        );
    });

    test("Validate Async with helper", async () => {
        // Assert
        await Abolish.attemptAsync("email@example.com", $yupAsync(Yup.string().email()));
    });

    test("Validate Async with helpers function", async () => {
        // Assert
        await Abolish.attemptAsync(
            "email@example.com",
            $yupAsync((yup) => yup.string().email())
        );
    });
});
