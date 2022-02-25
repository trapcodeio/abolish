const es = require("esbuild");
const fs = require("fs");

es.buildSync({
    entryPoints: ["./index.js"],
    format: "iife",
    outfile: "./browser.min.js",
    target: "es6",
    bundle: true,
    legalComments: "none",
    minify: true,
    external: ["joi"],
    globalName: "AbolishBrowser"
});

// log the file size of bundled file `./browser.js`
const file = __dirname + "/browser.min.js";
const stats = fs.statSync(file);

console.log("Abolish: New size is => ", humanFileSize(stats.size).split(" "));

const folder = __dirname + `/validators`;
let validatorFolders = ["array", "string"];

for (const f of validatorFolders) {
    const from = folder + `/${f}/index.js`;
    const to = folder + `/${f}/index.min.js`;
    const ff = f[0].toUpperCase() + f.slice(1);
    const name = `Abolish${ff}Validators`;

    es.buildSync({
        entryPoints: [from],
        target: "es6",
        legalComments: "none",
        format: "iife",
        outfile: to,
        bundle: true,
        minify: true,
        external: ["joi", "abolish"],
        globalName: name
    });

    // log the file size of bundled file `./browser.js`
    const stats = fs.statSync(to);
    console.log(`${name}: New size is => `, humanFileSize(stats.size).split(" "));
}

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
function humanFileSize(bytes, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + " B";
    }

    const units = si
        ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

    return bytes.toFixed(dp) + " " + units[u];
}
