require("ts-node").register();

const { configure } = require("japa");

configure({
    files: [
        "tests/validators/array-validators.spec.ts"
        // "tests/*.spec.ts",
        // "tests/*/**/*.spec.ts"
    ]
});
