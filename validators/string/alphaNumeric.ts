import type { AbolishValidator } from "../../src/Types";

export = <AbolishValidator>{
    name: "alphaNumeric",
    error: ":param is not AlphaNumeric.",
    validator: (str: any) => new RegExp(/^[a-z0-9]+$/i).test(str)
};
