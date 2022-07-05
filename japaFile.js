require("ts-node").register();

const { configure } = require("japa");

configure({
    files: [
        // "tests/functions.spec.ts"
        "tests/*.spec.ts",
        "tests/*/**/*.spec.ts"
    ]
});
