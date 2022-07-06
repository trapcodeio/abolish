import type { AbolishValidator } from "../../src/types";
import { assertType } from "../../src/types-checker";

type AllowOrBlock = { allow?: string[]; block?: string[] };
type UrlOption = boolean | { hostname?: AllowOrBlock; protocol?: AllowOrBlock };

export = <AbolishValidator>{
    name: "url",
    error: ":param is not a valid URL",
    description: ["Check that a value is a valid URL", "Allow/Block hostnames"],
    validator: (str, option: UrlOption, { error }) => {
        assertType(option, ["boolean", "object"]);

        let url: URL;

        try {
            url = new URL(str);
        } catch (e) {
            return false;
        }

        if (url && typeof option === "object") {
            // validate hostname
            if (option.hostname) {
                if (option.hostname.allow && !option.hostname.allow.includes(url.hostname)) {
                    return error(
                        `:param hostname is not among the allowed hostnames: [${option.hostname.allow.join(
                            ","
                        )}]`
                    ).setCode("hostname.notAllowed");
                }

                if (option.hostname.block && option.hostname.block.includes(url.hostname)) {
                    return error(":param hostname is not allowed.").setCode("hostname.blocked");
                }
            }

            // validate protocol
            if (option.protocol) {
                if (option.protocol.allow && !option.protocol.allow.includes(url.protocol)) {
                    return error(
                        `:param protocol is not among the allowed protocols: [${option.protocol.allow.join(
                            ","
                        )}]`
                    ).setCode("protocol.notAllowed");
                }

                if (option.protocol.block && option.protocol.block.includes(url.protocol)) {
                    return error(":param protocol is not allowed.").setCode("protocol.blocked");
                }
            }
        }

        return true;
    }
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            url: UrlOption;
        }
    }
}

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
