import test from "japa";
import { Abolish } from "../index";
import { AbolishSchema } from "../src/types";
import { $skip } from "../src/helpers";
import { Assert } from "japa/build/src/Assert";

function mayCompile(schema: AbolishSchema, compile: boolean): any {
    return compile ? Abolish.compileObject(schema) : schema;
}

function TestWildcardKeys(key: "*" | "$", assert: Assert, compiled: boolean) {
    /**
     * ======== Passes =========
     */
    let rules = mayCompile({ [key]: "required|typeof:string", email: true }, compiled);
    let data: Record<string, any> = { email: "mail@example.com" };
    let [err, body] = Abolish.validate<typeof data>(data, rules);

    assert.isUndefined(err);
    assert.deepEqual(body, data);

    // test with email rule having extra rules
    rules = mayCompile({ [key]: "required|typeof:string", email: "minLength:5" }, compiled);
    [err, body] = Abolish.validate<typeof data>(data, rules);

    assert.isUndefined(err);
    assert.deepEqual(body, data);

    /**
     * ======== Fails =========
     */
    rules = mayCompile({ [key]: "required|typeof:string", email: true }, compiled);
    data = { email: 123 };
    [err] = Abolish.validate<typeof data>(data, rules);

    assert.isDefined(err);
    assert.equal(err!.key, "email");
    assert.equal(err!.validator, "typeof");

    // test with email rule having extra rules
    rules = mayCompile({ [key]: "required|typeof:string", email: "minLength:5" }, compiled);
    // use ____ as email to trigger minLength error
    body = { email: "____" };
    [err] = Abolish.validate<typeof body>(body, rules);

    assert.isDefined(err);
    assert.equal(err!.key, "email");
    assert.equal(err!.validator, "minLength");
}

function Test$Include(assert: Assert, compiled: boolean) {
    /**
     * ======== Passes =========
     */
    let rules: AbolishSchema = mayCompile(
        { $include: ["password"], email: "required|typeof:string" },
        compiled
    );
    let data: Record<string, any> = { email: "mail@example.com", password: "12345" };
    let [err, body] = Abolish.validate<typeof data>(data, rules);

    assert.isUndefined(err);
    assert.deepEqual(body, data);

    /**
     * ======== Fails =========
     */
    rules = mayCompile({ email: "required|typeof:string" }, compiled);
    [err, body] = Abolish.validate<typeof data>(data, rules);

    assert.isUndefined(err);
    assert.deepEqual(body, { email: data.email });
}

function Test$Strict(assert: Assert, compiled: boolean) {
    /**
     * Test with $strict set to true
     */
    let rules: AbolishSchema = mayCompile(
        { $strict: true, email: "required|typeof:string" },
        compiled
    );
    let data: Record<string, any> = { email: "mail@example.com", password: "12345" };
    let [err, body] = Abolish.validate<typeof data>(data, rules);

    // there should be an error because password is not defined in the rules
    assert.isDefined(err);
    assert.equal(err!.code, "object.unknown");
    assert.isDefined(err!.data);
    assert.deepEqual(err!.data["unknown"], ["password"]);

    /**
     * Test with $strict set to array of keys
     */
    rules = mayCompile({ $strict: ["password"], email: "required|typeof:string" }, compiled);
    [err, body] = Abolish.validate<typeof data>(data, rules);

    // there should be no error because password is defined in the rules
    assert.isUndefined(err);
    assert.deepEqual(body, { email: data.email });

    /**
     * Test with $strict set to true and $include is set
     */
    rules = mayCompile(
        { $strict: true, $include: ["password"], email: "required|typeof:string" },
        compiled
    );
    [err, body] = Abolish.validate<typeof data>(data, rules);

    // there should be no error because $include field is appended to the rules
    assert.isUndefined(err);
    assert.deepEqual(body, data);
}

function Test$skip(compiled: boolean) {
    let data: Record<string, any> = { email: 123 };
    const name = compiled ? "$skip Compiled" : "$skip";

    test(`${name}: true`, (assert) => {
        const rules = mayCompile({ email: [{ $skip: true }, "required|typeof:string"] }, compiled);

        let [err, body] = Abolish.validate<typeof data>(data, rules);
        assert.isUndefined(err);
        assert.deepEqual(body, {});
    });

    test(`${name}: function resolved true`, (assert) => {
        const rules = mayCompile(
            { email: [$skip((v) => v === 123), "required|typeof:string"] },
            compiled
        );
        let [err, body] = Abolish.validate<typeof data>(data, rules);
        assert.isUndefined(err);
        assert.deepEqual(body, {});
    });

    test(`${name}: function resolved false`, (assert) => {
        const rules = mayCompile(
            { email: [$skip((v) => v !== 123), "required|typeof:string"] },
            compiled
        );
        let [err, body] = Abolish.validate<typeof data>(data, rules);
        assert.isDefined(err);
        assert.equal(err!.key, "email");
        assert.equal(err!.validator, "typeof");
    });
}

test.group("Super Wildcard Keys", () => {
    test("*", (assert) => {
        TestWildcardKeys("*", assert, false);
    });

    test("* Compiled", (assert) => {
        TestWildcardKeys("*", assert, true);
    });

    test("$", (assert) => {
        TestWildcardKeys("$", assert, false);
    });

    test("$ Compiled", (assert) => {
        TestWildcardKeys("$", assert, true);
    });
});

test.group("Super Field Keys", () => {
    test("$include", (assert) => {
        Test$Include(assert, false);
    });

    test("$include Compiled", (assert) => {
        Test$Include(assert, true);
    });

    test("$strict", (assert) => {
        Test$Strict(assert, false);
    });

    test("$strict Compiled", (assert) => {
        Test$Strict(assert, true);
    });
});

test.group("Super Rules Keys", () => {
    Test$skip(false);
    // Compiled
    Test$skip(true);
});
