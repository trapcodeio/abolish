import type { AbolishValidator } from "../../src/Types";

export default <AbolishValidator>{
    name: "boolean",
    error: ":param is not a valid boolean",
    /**
     * @param str
     * @param option
     * @param {ObjectModifier} modifier
     * @return {boolean}
     */
    validator: (str, option, { modifier }) => {
        if (typeof str == "boolean") {
            return true;
        } else if (typeof str === "string") {
            str = str.toLowerCase();

            if (str === "true") {
                modifier.setThis(true);
                return true;
            } else if (str === "false") {
                modifier.setThis(false);
                return true;
            }
        } else if (typeof str === "number") {
            if (str === 1) {
                modifier.setThis(true);
                return true;
            } else if (str === 0) {
                modifier.setThis(false);
                return true;
            }
        } else {
            return false;
        }
    }
};
