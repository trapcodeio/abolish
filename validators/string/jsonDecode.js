module.exports = {
    name: 'jsonDecode',
    error: ':param is not a valid JSON string',
    /**
     * @param str
     * @param option
     * @param {ObjectModifier} modifier
     */
    validator: (str, option, {modifier}) => {
        modifier.setThis(JSON.parse(str));
    }
}