import { Abolish } from "../index";
import { registerAllValidators } from "../src/ValidatorHelpers";
import { RuleTyped } from "../src/functions";
import test from "japa";
import { AbolishCompiled } from "../src/Compiler";

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

    test.only("Super Rules: *, $ and $include", () => {
        const compiled = Abolish.compileObject({
            $: "required|typeof:string",
            name: "minLength:3|maxLength:10"
        });
        console.log(compiled);
    });
});
