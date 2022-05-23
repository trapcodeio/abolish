import type { AbolishValidator } from "../../src/Types";

export = <AbolishValidator>{
    name: "any",
    validator: () => {
        throw new Error(`Abolish: [any] is deprecated, use [inArray] instead.`);
    }
};
