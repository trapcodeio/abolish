import { Abolish } from "../index";
import { AbolishSchemaTyped, SchemaTyped, RuleTyped } from "../src/functions";
import test from "japa";
import { AbolishCompiled } from "../src/Compiler";
import { SuperKeys } from "../src/Abolish";

let schema = SchemaTyped({
    $: "required",
    name: RuleTyped([
        "typeof:string|minLength:3",
        {
            $skip: () => false,
            $errors: { typeof: "Name is not a string" }
        }
    ]),
    $include: ["age"]
});

test.group("Compiler", () => {
    test("compile", (assert) => {
        const compiled = Abolish.compile(schema.name);
        assert.isFalse(compiled.isObject);

        const compiledKeys = Object.keys(compiled.data);

        // check that input matches compiled input
        assert.deepEqual(schema.name, compiled.input);

        // check that input value is instanceOf AbolishCompiled
        assert.instanceOf(compiled, AbolishCompiled);

        // check that compiled fields has every key in compiled.data
        assert.isTrue(compiledKeys.every((key) => compiled.fields.includes(key)));

        // check that fields has included fields
        assert.isTrue(compiled.includedFields.every((key) => compiled.fields.includes(key)));
    });

    test("compileObject", (assert) => {
        const compiled = Abolish.compileObject(schema);
        assert.isTrue(compiled.isObject);

        const schemaKeys = Object.keys(schema);
        const compiledKeys = Object.keys(compiled.data);

        // check that input matches compiled input
        assert.deepEqual(schema, compiled.input);

        // check that input value is instanceOf AbolishCompiled
        assert.instanceOf(compiled, AbolishCompiled);

        // check that every compiled key belongs to the input object
        assert.isTrue(compiledKeys.every((key) => schemaKeys.includes(key)));

        // check that compiled fields has every key in compiled.data
        assert.isTrue(compiledKeys.every((key) => compiled.fields.includes(key)));

        // check that fields has included fields
        assert.deepEqual(compiled.includedFields, ["age"]);
        assert.isTrue(compiled.includedFields.every((key) => compiled.fields.includes(key)));
    });

    test("Validate Variable", (assert) => {
        const compiled = Abolish.compile(schema.name);
        assert.hasAllKeys(compiled.data, ["variable"]);

        // pass
        const result = compiled.validate("A STRING");
        assert.isUndefined(result[0]);
        assert.equal(result[1], "A STRING");

        // fail
        const result2 = compiled.validate(1);
        assert.isDefined(result2[0]);

        // using custom error.
        assert.equal(result2[0]!.message, "Name is not a string");
    });
});

test.group("Compiler Super Fields", () => {
    test("Wildcards: *, $", (assert) => {
        const compiled = Abolish.compileObject({
            "*": "required|typeof:string",
            name: "minLength:3|maxLength:10"
        });

        const compiled2 = Abolish.compileObject({
            $: "required|typeof:string",
            name: "minLength:3|maxLength:10"
        });

        // Make sure wildcards are not mistaken for fields
        assert.isTrue(SuperKeys.Fields.every((key) => !compiled.fields.includes(key)));
        assert.deepEqual(compiled.fields, ["name"]);
        assert.deepEqual(compiled2.fields, ["name"]);

        /**
         * Check that all wildcards are added to compiled validators
         */
        for (const field in compiled.data) {
            const validators = compiled.data[field].validators;
            const validatorNames = Object.keys(validators);
            assert.isTrue(["required", "typeof"].every((v) => validatorNames.includes(v)));
        }

        for (const field in compiled2.data) {
            const validators = compiled.data[field].validators;
            const validatorNames = Object.keys(validators);
            assert.isTrue(["required", "typeof"].every((v) => validatorNames.includes(v)));
        }
    });

    test("$include", (assert) => {
        const compiled = Abolish.compileObject({
            name: "minLength:3|maxLength:10",
            $include: ["age"]
        });

        // check includedFields
        assert.deepEqual(compiled.includedFields, ["age"]);

        // check that includedFields are added to compiled fields
        assert.isTrue(compiled.fields.includes("age"));

        // validate
        const [e, v] = compiled.validate({ name: "My name", age: 1 });
        assert.isUndefined(e);
        assert.equal(v.age, 1);
    });
});

test.group("Compiler Super Rules", () => {
    test("$name", (assert) => {
        const compiled = Abolish.compileObject({
            name: [{ $name: "Your Name" }, "minLength:3|maxLength:10"]
        });

        // check that compiled validators have correct name
        assert.isDefined(compiled.data.name.$name);
        assert.equal(compiled.data.name.$name, "Your Name");

        // check that error message has name
        const [e] = compiled.validate({ name: "a" });
        assert.isDefined(e);
        assert.equal(e!.message, "Your Name is too short. (Min. 3 characters)");
    });

    test("$skip", (assert) => {
        const compiled = Abolish.compileObject<AbolishSchemaTyped>({
            name: ["required|typeof:string", { $skip: true }],
            age: ["required|typeof:number", { $skip: () => true }]
        });

        // check that $skip is added to compiled validator..
        for (const field in compiled.data) {
            const data = compiled.data[field];
            assert.isDefined(data.$skip);
        }

        // validate
        const [e, v] = compiled.validate({ name: "My name", age: 1 });
        assert.isUndefined(e);
        assert.isEmpty(v);
    });

    test("$skip & $include", (assert) => {
        const compiled = Abolish.compileObject<AbolishSchemaTyped>({
            name: ["required|typeof:string", { $skip: true }],
            age: ["required|typeof:number", { $skip: () => true }],
            $include: ["age"]
        });

        // check that $skip is added to compiled validator..
        for (const field in compiled.data) {
            const data = compiled.data[field];
            assert.isDefined(data.$skip);
        }

        // validate
        const [e, v] = compiled.validate({ name: "My name", age: 1 });
        assert.isUndefined(e);
        assert.doesNotHaveAnyKeys(v, ["name"]);
        assert.hasAnyKeys(v, ["age"]);
    });
});

test.group("Using compiled rules with abolish", () => {
    test("Abolish.validate()", (assert) => {
        const compiled = Abolish.compileObject<AbolishSchemaTyped>(schema);
        // pass
        const [e, v] = Abolish.validate<{ name: string; age: number }>(
            { name: "My name", age: 1 },
            compiled
        );

        assert.isUndefined(e);
        assert.deepEqual(Object.keys(v), ["name", "age"]);

        assert.equal(v.name, "My name");
        assert.equal(v.age, 1);
    });

    test("Abolish.validateAsync()", async (assert) => {
        const compiled = Abolish.compileObject<AbolishSchemaTyped>(schema);
        // pass
        const [e, v] = await Abolish.validateAsync<{ name: string; age: number }>(
            { name: "My name", age: 1 },
            compiled
        );

        assert.isUndefined(e);
        assert.deepEqual(Object.keys(v), ["name", "age"]);

        assert.equal(v.name, "My name");
        assert.equal(v.age, 1);
    });

    test("Abolish.check()", (assert) => {
        const compiled = Abolish.compile(schema.name);

        // pass
        const [e, v] = Abolish.check("My name", compiled);
        assert.isUndefined(e);
        assert.equal(v, "My name");

        // fail
        const [e2, v2] = Abolish.check(1, compiled);
        assert.isDefined(e2);
        assert.isUndefined(v2);
        assert.equal(e2!.message, "Name is not a string");
    });

    test("Abolish.checkAsync()", async (assert) => {
        const compiled = Abolish.compile(schema.name);

        // pass
        const [e, v] = await Abolish.checkAsync("My name", compiled);
        assert.isUndefined(e);
        assert.equal(v, "My name");

        // fail
        const [e2, v2] = await Abolish.checkAsync(1, compiled);
        assert.isDefined(e2);
        assert.isUndefined(v2);
        assert.equal(e2!.message, "Name is not a string");
    });

    test("Abolish.attempt()", (assert) => {
        const compiled = Abolish.compile(schema.name);

        // pass
        const name = Abolish.attempt("My name", compiled);
        assert.equal(name, "My name");

        // fail
        try {
            const value = Abolish.attempt(1, compiled);
            assert.isUndefined(value);
        } catch (e: any) {
            assert.equal(e.message, "Name is not a string");
        }
    });

    test("Abolish.attemptAsync()", async (assert) => {
        const compiled = Abolish.compile(schema.name);

        // pass
        const name = await Abolish.attemptAsync("My name", compiled);
        assert.equal(name, "My name");

        // fail
        try {
            const value = await Abolish.attemptAsync(1, compiled);
            assert.isUndefined(value);
        } catch (e: any) {
            assert.equal(e.message, "Name is not a string");
        }
    });

    test("Abolish.test()", (assert) => {
        const compiled = Abolish.compile(schema.name);

        assert.isTrue(Abolish.test("My name", compiled));
        assert.isFalse(Abolish.test(1, compiled));
    });

    test("Abolish.testAsync()", async (assert) => {
        const compiled = Abolish.compile(schema.name);

        assert.isTrue(await Abolish.testAsync("My name", compiled));
        assert.isFalse(await Abolish.testAsync(1, compiled));
    });
});
