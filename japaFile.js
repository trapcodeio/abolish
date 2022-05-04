require("ts-node").register();

const { configure } = require("japa");

configure({
    files: [
        // "tests/validators/utils-validators.spec.ts"
        "tests/*.spec.ts",
        "tests/*/**/*.spec.ts"
    ]
});
