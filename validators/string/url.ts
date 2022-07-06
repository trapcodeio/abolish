import type { AbolishValidator } from "../../src/Types";
import { assertType } from "../../src/types-checker";

export = <AbolishValidator>{
    name: "url",
    error: ":param is not a valid URL",
    validator: (
        str,
        option: boolean | { allowedHostnames: string[]; denyHostnames: string[] },
        { error }
    ) => {
        assertType(option, ["boolean", "object"]);

        let url: URL;

        try {
            url = new URL(str);
        } catch (e) {
            return false;
        }

        if (url && typeof option === "object") {
            if (option.allowedHostnames) {
                if (!option.allowedHostnames.includes(url.hostname)) {
                    return error(
                        `:param hostname is not among the allowed hostnames: [${option.allowedHostnames.join(
                            ","
                        )}]`
                    );
                }
            }

            if (option.denyHostnames) {
                if (option.denyHostnames.includes(url.hostname)) {
                    return error(":param hostname is not allowed.");
                }
            }
        }

        return true;
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
