/**
 * This file moves required
 */
import fs = require("fs");


async function main() {
    const PackageDotJson = require('./package.json');
    PackageDotJson.main = "index.js";
    PackageDotJson.types = "index.d.ts";

    fs.writeFileSync(`${__dirname}/js/package.json`, JSON.stringify(PackageDotJson, null, 2));
}

main().then(() => process.exit())