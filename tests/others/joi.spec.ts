import test from "japa";
import { Abolish } from "../../index";
import { $joi, useJoi } from "../../others/joi";
import joi from "joi";

test.group("Joi: Setup", () => {
    test("Use", (assert) => {
        // Register Joi
        useJoi(Abolish);

        // Validators
        const validators = Abolish.getGlobalValidators();

        // $joi
        assert.include(Object.keys(validators), "$joi");

        // Test with instance
        const abolish = new Abolish();

        useJoi(abolish);

        assert.include(Object.keys(abolish.validators), "$joi");
    });

    test("Use with custom joi", (assert) => {
        // Register Joi
        useJoi(Abolish, joi);

        // Validators
        const validators = Abolish.getGlobalValidators();

        // $joi
        assert.include(Object.keys(validators), "$joi");

        // Test with instance
        const abolish = new Abolish();

        useJoi(abolish, joi);

        assert.include(Object.keys(abolish.validators), "$joi");
    });
});

test.group("Joi Usage", (group) => {
    group.before(() => {
        // Register Joi
        useJoi(Abolish);
    });

    test("Validate", () => {
        // Assert
        Abolish.attempt("email@example.com", { $joi: joi.string().email() });
    });

    test("Validate with helper", () => {
        // Assert
        Abolish.attempt("email@example.com", $joi(joi.string().email()));
    });

    test("Validate with helpers function", () => {
        // Assert
        Abolish.attempt(
            "email@example.com",
            $joi((joi) => joi.string().email())
        );
    });
});
