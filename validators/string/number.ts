import type { AbolishValidator } from "../../src/Types";

export default <AbolishValidator>{
    name: "number",
    error: ":param is not a valid number",
    /**
     *
     * @param number
     * @param option
     * @param {ObjectModifier} modifier
     * @return {boolean}
     */
    validator: (number, option, { modifier }) => {
        const isNumber = !isNaN(number);

        // Cast to number if not number
        if (modifier && isNumber && typeof number !== "number") {
            modifier.setThis(Number(number));
        }

        return isNumber;
    }
};
