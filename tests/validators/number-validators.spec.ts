/**
 * Test all number validators
 */

import test from "japa";
import Abolish from "../../src/Abolish";
import NumberValidators from "../../validators/number";
import { RuleTyped } from "../../src/functions";

test.group("Number Validators", (group) => {
    group.before(() => {
        Abolish.addGlobalValidators(NumberValidators);
    });

    test("gt", (assert) => {
        const [err, value] = Abolish.check(11, RuleTyped({
            gt: 10
        }));

        assert.isUndefined(err);
        assert.equal(value, 11);
    })

    test.failing("gt should fail", () => {
        Abolish.attempt(10, "gt:10");
    })

    test("lt", (assert) => {
        const [err, value] = Abolish.check(9, RuleTyped({
            lt: 10
        }));

        assert.isUndefined(err);
        assert.equal(value, 9);
    })

    test.failing("lt should fail", () => {
        Abolish.attempt(10, "lt:10");
    })

});