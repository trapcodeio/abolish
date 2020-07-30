module.exports = {
    name: 'boolean',
    error: ':param is not a boolean',
    /**
     * @param str
     * @param option
     * @param {ObjectModifier} modifier
     * @return {boolean}
     */
    validator: (str, option, {modifier}) => {

        if (typeof str == "boolean") return true;
        if (typeof str === "string") {
            str = str.toLowerCase();

            if (str === 'true') {
                modifier.setThis(true)
                return true;
            } else if (str === 'false') {
                modifier.setThis(false);
                return true
            }
        }

        return false;

    }
}