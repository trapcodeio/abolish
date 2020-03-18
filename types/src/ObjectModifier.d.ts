/**
 * ObjectOnValidation
 * Handles object being validated.
 */
declare class ObjectModifier {
    data: any;
    path: any;
    constructor(data: any, param: string);
    /**
     * Get path of object or return
     * @method
     * @param path
     * @param $default
     * @return {*}
     */
    get(path: any, $default?: undefined): any;
    /**
     * Has path in object
     * @method
     * @param path
     * @return {boolean}
     */
    has(path: string): boolean;
    /**
     * Set value to path of object
     * @method
     * @param path
     * @param value
     * @return {object}
     */
    set(path: string, value: any): any;
    /**
     * Set value to this param path
     * @methods
     * @param value
     * @return {*}
     */
    setThis(value: any): any;
    /**
     * Unset a path in object
     * @method
     * @param path
     * @return {boolean}
     */
    unset(path: string): boolean;
    /**
     * Unset this path in object
     * @method
     * @return {boolean}
     */
    unsetThis(): boolean;
}
export = ObjectModifier;
