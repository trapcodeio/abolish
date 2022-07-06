/**
 * AbolishError
 * @class
 * This class can be used to return custom errors to the validation process
 */
class AbolishError {
    public message: string;
    public data?: any;
    public code: string = "default";

    constructor(message: string, data?: any) {
        this.message = message;
        if (data) this.data = data;
        return this;
    }

    /**
     * Set code
     * @param code - A custom error code
     * @returns {this} - Returns the current instance
     * @example
     * new AbolishError("Invalid value").setCode(data);
     */
    setCode(code: string): this {
        this.code = code;
        return this;
    }

    /**
     * Set data
     * @param data - A custom data
     * @returns {this} - Returns the current instance
     * @example
     * new AbolishError("Invalid value").setData(data);
     */
    setData(data: any): this {
        this.data = data;
        return this;
    }

    /**
     * Set message
     * @param message - A custom message
     * @returns {this} - Returns the current instance
     * @example
     * new AbolishError("Invalid value").setMessage(message);
     */
    setMessage(message: string): this {
        this.message = message;
        return this;
    }
}

export = AbolishError;
