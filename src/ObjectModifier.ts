import { Set, Get, StartCase } from "./Functions";
import has from "lodash.has";
import unset from "lodash.unset";

/**
 * ObjectOnValidation
 * Handles object being validated.
 */
class ObjectModifier {
    data: any;
    path: any;

    constructor(data: any, param: string) {
        this.data = data;
        this.path = param;
        return this;
    }

    /**
     * Get path of object or return
     * @method
     * @param path
     * @param $default
     * @return {*}
     */
    get(path: any, $default = undefined) {
        return Get(this.data, path, $default);
    }

    /**
     * Has path in object
     * @method
     * @param path
     * @return {boolean}
     */
    has(path: string) {
        return has(this.data, path);
    }

    /**
     * Set value to path of object
     * @method
     * @param path
     * @param value
     * @return {object}
     */
    set(path: string, value: any) {
        return Set(this.data, path, value);
    }

    /**
     * Set value to this param path
     * @methods
     * @param value
     * @return {*}
     */
    setThis(value: any) {
        return this.set(this.path, value);
    }

    /**
     * Unset a path in object
     * @method
     * @param path
     * @return {boolean}
     */
    unset(path: string) {
        return unset(this.data, path);
    }

    /**
     * Unset this path in object
     * @method
     * @return {boolean}
     */
    unsetThis() {
        return unset(this.data, this.path);
    }

    /**
     * Get current path but with StartCase
     */
    getPath(): string {
        return StartCase(this.path);
    }
}

export = ObjectModifier;
