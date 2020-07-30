module.exports = {
    name: 'number',
    error: ':param is not a valid number',
    /**
     *
     * @param number
     * @param option
     * @param {ObjectModifier} modifier
     * @return {boolean}
     */
    validator: (number, option, {modifier}) => {
        const isNumber = !isNaN(number);
        // Cast to number
        if (isNumber && modifier) {
            modifier.setThis(Number(number));
        }
        // return function
        return isNumber
    }
}