import type { AbolishValidator } from "../../src/Types";

export = <AbolishValidator>{
    name: "any",
    validator: (v: any, o: any[], { error }) => {
        return o.includes(v) ? true : error(`:param must be one of: [${o.join(", ")}]`);
    }
};
