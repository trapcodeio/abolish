"use strict";
/**
 * AbolishError
 * @class
 * This class can be used to return custom errors to the validation process
 */
class AbolishError {
    constructor(message, data) {
        this.message = message;
        if (data) {
            this.data = data;
        }
        else {
            this.data = {};
        }
        return this;
    }
    setData(data) {
        this.data = data;
        return data;
    }
}
module.exports = AbolishError;
