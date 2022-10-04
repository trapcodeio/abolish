import { abolish_Set, abolish_Get, abolish_StartCase, hasDotNotation } from "./inbuilt.fn";
import { has, unset } from "lodash";

/**
 * ObjectOnValidation
 * Handles object being validated.
 */
class ObjectModifier {
    data: any;
    path: any;
    name: string | false;
    private $hasData = true;
    private readonly pathHasDotNotation;

    constructor(data: any, param: string, name: string | false = false) {
        this.data = data;
        this.path = param;
        this.name = name;
        this.pathHasDotNotation = hasDotNotation(param);
        return this;
    }

    flagNoData() {
        this.$hasData = false;
        return this;
    }

    setData(data: any) {
        this.data = data;
        this.$hasData = true;
        return this;
    }

    // get hasData() {
    //     return this.$hasData;
    // }

    /**
     * Get path of object or return
     * @method
     * @param path
     * @return {*}
     */
    get(path: any) {
        return abolish_Get(this.data, path);
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
        return abolish_Set(this.data, this.path, value, this.pathHasDotNotation);
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

    /**
     * Get current path but with abolish_StartCase
     */
    getNameRaw(): string {
        return this.name || this.path;
    }
}

export = ObjectModifier;
