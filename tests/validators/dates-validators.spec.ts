/**
 * Test all util validators
 */

import test from "japa";
import Abolish from "../../src/Abolish";
import { registerValidators } from "../../src/ValidatorHelpers";
import { RuleTyped } from "../../src/functions";

test.group("Date Validators", (group) => {
    group.before(() => {
        registerValidators(Abolish, "date");
    });

    let now = new Date();
    let seventeenYearsAgo = new Date(now.getFullYear() - 17, now.getMonth(), now.getDate());
    let eighteenYearsAgo = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
    let nineteenYearsAgo = new Date(now.getFullYear() - 19, now.getMonth(), now.getDate());

    test.failing("Invalid Date", () => {
        Abolish.attempt("Not a valid date", RuleTyped({ age: "=18" }));
    });

    test("Pass: Exact Age", () => {
        Abolish.attempt(eighteenYearsAgo, "age:18");
        Abolish.attempt(eighteenYearsAgo, RuleTyped({ age: "=18" }));
    });

    test.failing("Fail: Exact Age", () => {
        Abolish.attempt(seventeenYearsAgo, RuleTyped({ age: "=18" }));
    });

    test("Pass: Min Age", () => {
        Abolish.attempt(eighteenYearsAgo, RuleTyped({ age: ">17" }));
    });

    test.failing("Fail: Min Age", () => {
        Abolish.attempt(seventeenYearsAgo, RuleTyped({ age: ">18" }));
    });

    test("Pass: Max Age", () => {
        Abolish.attempt(eighteenYearsAgo, RuleTyped({ age: "<19" }));
    });

    test.failing("Fail: Max Age", () => {
        Abolish.attempt(nineteenYearsAgo, RuleTyped({ age: "<18" }));
    });

    test("Pass: Between Age", () => {
        Abolish.attempt(eighteenYearsAgo, RuleTyped({ age: "18-19" }));
    });

    test.failing("Fail: Between Age", () => {
        Abolish.attempt(seventeenYearsAgo, RuleTyped({ age: "18-19" }));
    });

    test("Pass: Gte Age", () => {
        Abolish.attempt(eighteenYearsAgo, RuleTyped({ age: ">=18" }));
    });

    test.failing("Fail: Gte Age", () => {
        Abolish.attempt(seventeenYearsAgo, RuleTyped({ age: ">=18" }));
    });

    test("Pass: Lte Age", () => {
        Abolish.attempt(eighteenYearsAgo, RuleTyped({ age: "<=18" }));
    });

    test.failing("Fail: Lte Age", () => {
        Abolish.attempt(nineteenYearsAgo, RuleTyped({ age: "<=18" }));
    });


});
