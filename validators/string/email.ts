import type { AbolishValidator } from "../../src/Types";

export = <AbolishValidator>{
    name: "email",
    error: ":param is not a valid email.",
    validator: (email) => {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
    }
};
