require("ts-node").register();

const { configure } = require("japa");

configure({
    files: [
        // "tests/super_rules.spec.ts"
        "tests/*.spec.ts",
        "tests/*/**/*.spec.ts"
    ]
});
