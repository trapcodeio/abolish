import type { AbolishValidator } from "../../src/Types";
import { assertType } from "../../src/types-checker";

export = <AbolishValidator>{
    name: "arraySize",
    validator(value: any[], size: number | number[], { error }) {
        assertType(size, ["number", "array"]);

        const arrLen = value.length;
        if (typeof size === "number" && arrLen === size) return true;
        else if (Array.isArray(size) && size.includes(arrLen)) return true;

        return error(`:param array length must be [${size}], but [${arrLen}] was given.`);
    }
};
