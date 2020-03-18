/**
 * AbolishError
 * @class
 * This class can be used to return custom errors to the validation process
 */
declare class AbolishError {
    message: string;
    data: any;
    constructor(message: string, data?: any);
    setData(data: any): any;
}
export = AbolishError;
