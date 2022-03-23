import type { AbolishValidator } from "../../src/Types";

export = <AbolishValidator>{
    name: "same",
    error: ":param must be the same as :option",
    validator: (v, o, { modifier }) => {
        return v === modifier.get(o);
    }
};
