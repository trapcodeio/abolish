import {AbolishValidator} from "../../src/Types";

export = <AbolishValidator>{
    name: 'regex',
    error: ':param failed Regex test.',
    validator: (str, regex) => {
        const isRegex = regex instanceof RegExp;
        if (typeof str !== "string" && !isRegex) return false;

        if (regex) {
            return regex.test(str);
        } else {
            return RegExp(regex).test(str);
        }
    }
}