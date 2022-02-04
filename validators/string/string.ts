import type { AbolishValidator } from "../../src/Types";
import type ObjectModifier from "../../src/ObjectModifier";

export = <AbolishValidator>{
    name: "string",
    validator: (str: string | undefined, option: any, { modifier, error }) => {
        if (option === undefined) {
            if (typeof str === "string" && str.length > 0) {
                return true;
            }

            return error(`:param is not a string`);
        }

        if (typeof option !== "string")
            throw new Error(`string: Validator option must be a string`);

        if (option.indexOf(",") > 0) {
            for (const opt of option.split(",")) {
                runThis(opt, modifier);
            }
        } else {
            runThis(option, modifier);
        }

        return true;
    }
};

function runThis(option: any, modifier: ObjectModifier) {
    // Get current string from state.
    const str = modifier.getThis();

    // @ts-ignore
    if (typeof str[option] === "function") {
        // this is a single function call
        // E.g str.trim()
        // @ts-ignore
        modifier.setThis(String(str)[option]());
    } else {
        throw new Error(`Validator string:${option} is not supported!`);
    }
}
