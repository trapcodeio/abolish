/**
 * This file moves required
 */
import fs = require("fs");


async function main() {
    const PackageDotJson = require('./package.json');

    // Modify Package.json
    PackageDotJson.main = "index.js";
    PackageDotJson.types = "index.d.ts";

    // Copy Package.json
    fs.writeFileSync(`${__dirname}/js/package.json`, JSON.stringify(PackageDotJson, null, 2));
    // Copy readme.md
    fs.copyFileSync(`${__dirname}/readme.md`, `${__dirname}/js/readme.md`);
}

main().then(() => process.exit())