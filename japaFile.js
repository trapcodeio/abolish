require("ts-node").register();

const { configure } = require("japa");

configure({
    files: [
        "tests/compiler.spec.ts"
        // "tests/*.spec.ts",
        // "tests/*/**/*.spec.ts"
    ]
});
