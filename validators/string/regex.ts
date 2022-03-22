import type { AbolishValidator } from "../../src/Types";

export default <AbolishValidator>{
    name: "regex",
    error: ":param failed Regex validation.",
    validator: (str, regex) => {
        const isRegex = regex instanceof RegExp;
        if (typeof str !== "string") return false;

        if (isRegex) {
            return regex.test(str);
        } else {
            return new RegExp(regex).test(str);
        }
    }
};
