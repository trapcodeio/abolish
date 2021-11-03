import type { AbolishValidator } from "../../src/Types";

export = <AbolishValidator>{
    name: "any",
    validator: (v: any, o: any[]) => {
        return o.includes(v);
    },
    error: `:param does not match options: [ :option ].`
};
