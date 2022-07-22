import { Abolish } from "../index";
import { registerAllValidators } from "../src/ValidatorHelpers";
import { AbolishSchemaTyped, RuleTyped } from "../src/functions";
import test from "japa";
import { AbolishCompiled } from "../src/Compiler";
import { SuperKeys } from "../src/Abolish";

test.group("Compiler", (group) => {
    let schema: any;

    group.before(() => {
        registerAllValidators(Abolish);
        /**
         * Test Compiler
         */

        schema = {
            $: "required",
            name: RuleTyped([
                "typeof:string",
                {
                    $skip: () => false,
                    $error: "Name is required",
                    $errors: { typeof: "Name is not a string" }
                }
            ]),
            $include: ["age"]
        };
    });

    test("compile", (assert) => {
        const compiled = Abolish.compile(schema.name);
        assert.isFalse(compiled.isObject);

        const compiledKeys = Object.keys(compiled.data);

        // check that schema value is instanceOf AbolishCompiled
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

        // check that schema value is instanceOf AbolishCompiled
        assert.instanceOf(compiled, AbolishCompiled);

        // check that every compiled key belongs to the schema object
        assert.isTrue(compiledKeys.every((key) => schemaKeys.includes(key)));

        // check that compiled fields has every key in compiled.data
        assert.isTrue(compiledKeys.every((key) => compiled.fields.includes(key)));

        // check that fields has included fields
        assert.deepEqual(compiled.includedFields, ["age"]);
        assert.isTrue(compiled.includedFields.every((key) => compiled.fields.includes(key)));
    });

    test("Validate Variable", (assert) => {
        const compiled = Abolish.compile(schema.name);

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

test.group("Compiler Super Fields", (group) => {
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
            const validatorNames = validators.map((v) => v.name);
            assert.isTrue(["required", "typeof"].every((v) => validatorNames.includes(v)));
        }

        for (const field in compiled2.data) {
            const validators = compiled.data[field].validators;
            const validatorNames = validators.map((v) => v.name);
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

test.group("Compiler Super Rules", (group) => {
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
