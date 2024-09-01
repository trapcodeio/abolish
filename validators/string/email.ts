import type { AbolishValidator } from "../../src/types";

export = <AbolishValidator>{
    name: "email",
    error: ":param is not a valid email.",
    validator: (email: string, action: "lowercase" | boolean, { modifier }) => {
        // skip if action is false
        if (action === false) return true;

        // Check if email is valid
        const isValidMail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,6})+$/.test(email);

        // Convert to lowercase if action is set to lowercase
        if (isValidMail && action === "lowercase" && modifier) {
            modifier.setThis(email.toLowerCase());
        }

        return isValidMail;
    }
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            email: "lowercase" | boolean;
        }
    }
}
