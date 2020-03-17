"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const get_1 = __importDefault(require("lodash/get"));
const set_1 = __importDefault(require("lodash/set"));
const has_1 = __importDefault(require("lodash/has"));
const unset_1 = __importDefault(require("lodash/unset"));
/**
 * ObjectOnValidation
 * Handles object being validated.
 */
class ObjectModifier {
    constructor(data, param) {
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
    get(path, $default = undefined) {
        return get_1.default(this.data, path, $default);
    }
    /**
     * Has path in object
     * @method
     * @param path
     * @return {boolean}
     */
    has(path) {
        return has_1.default(this.data, path);
    }
    /**
     * Set value to path of object
     * @method
     * @param path
     * @param value
     * @return {object}
     */
    set(path, value) {
        return set_1.default(this.data, path, value);
    }
    /**
     * Set value to this param path
     * @methods
     * @param value
     * @return {*}
     */
    setThis(value) {
        return this.set(this.path, value);
    }
    /**
     * Unset a path in object
     * @method
     * @param path
     * @return {boolean}
     */
    unset(path) {
        return unset_1.default(this.data, path);
    }
    /**
     * Unset this path in object
     * @method
     * @return {boolean}
     */
    unsetThis() {
        return unset_1.default(this.data, this.path);
    }
}
module.exports = ObjectModifier;
