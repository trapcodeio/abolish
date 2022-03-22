import type { AbolishValidator } from "../../src/Types";

export default <AbolishValidator>{
    name: "json",
    error: ":param is not a valid JSON string",
    validator: (str) => {
        if (typeof str !== "string") return false;
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }
};
