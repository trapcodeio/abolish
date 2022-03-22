import type { AbolishValidator } from "../../src/Types";

export default <AbolishValidator>{
    name: "url",
    error: ":param is not a valid URL",
    validator: (str) => {
        try {
            new URL(str);
            return true;
        } catch (e) {
            return false;
        }
    }
};

/**
 * ----------------------------------------------------
 * REGEX PAST TRIALS
 * ----------------------------------------------------
 */

/**
 * First Regexp from https://mathiasbynens.be/demo/url-regex
 * Almost perfect
 * Does not allow ports.
 */
// const pattern = new RegExp(
//     "^(https?:\\/\\/)?" + // protocol
//         "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
//         "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
//         "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
//         "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
//         "(\\#[-a-z\\d_]*)?$",
//     "i"
// ); // fragment locator

/**
 * Second Regexp from https://www.regextester.com/96504
 * Allows some urls that we can't consider valid
 * e.g "http://" "127.0.0.1 a space"
 */
// const pattern = new RegExp(
//     "(?:(?:https?|ftp):\\/\\/|\\b[a-z\\d]+\\.)(?:(?:[^\\s()<>]+|\\((?:[^\\s()<>]+|\\([^\\s()<>]+\\))?\\))+(?:\\((?:[^\\s()<>]+|\\(?:[^\\s()<>]+\\))?\\)|[^\\s`!()\\[\\]{};:'\".,<>?«»“”‘’]))?",
//     "ig"
// ); // fragment locator

// return pattern.test(str);
