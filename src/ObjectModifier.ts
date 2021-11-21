import { abolish_Set, abolish_Get, abolish_StartCase } from "./Functions";
import { has, unset } from "lodash";

/**
 * ObjectOnValidation
 * Handles object being validated.
 */
class ObjectModifier {
    data: any;
    path: any;
    name: string | false;

    constructor(data: any, param: string, name: string | false) {
        this.data = data;
        this.path = param;
        this.name = name;
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
        return abolish_Get(this.data, path, $default);
    }

    /**
     * Get path of current key being validated
     * @method
     */
    getThis() {
        return this.get(this.path);
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
     * abolish_Set value to path of object
     * @method
     * @param path
     * @param value
     * @return {object}
     */
    set(path: string, value: any) {
        return abolish_Set(this.data, path, value);
    }

    /**
     * abolish_Set value to this param path
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
     * Get current path but with abolish_StartCase
     */
    getName(): string {
        return this.name || abolish_StartCase(this.path);
    }
}

export = ObjectModifier;
