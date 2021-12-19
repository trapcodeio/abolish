import type { AbolishValidator } from "../../src/Types";

export = <AbolishValidator>{
    name: "md5",
    error: ":param is not a valid MD5 string",
    validator: (str) => {
        // Regular expression to check if string is a MD5 hash
        const regexExp = /^[a-f0-9]{32}$/gi;

        return regexExp.test(str);
    }
};
