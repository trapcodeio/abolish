/**
 * AbolishError
 * @class
 * This class can be used to return custom errors to the validation process
 */
class AbolishError {
    message: string;
    data: any;

    constructor(message: string, data?: any) {
        this.message = message;

        if (data) {
            this.data = data;
        } else {
            this.data = {};
        }

        return this;
    }

    setData(data: any) {
        this.data = data;
        return data;
    }
}

export default AbolishError;
