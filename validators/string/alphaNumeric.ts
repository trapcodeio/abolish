import {AbolishValidator} from "../../src/Types";

export = <AbolishValidator>{
    name: 'alphaNumeric',
    error: ':param allows only AlphaNumeric characters.',
    validator: (str: any) => (new RegExp(/^[a-z0-9]+$/i)).test(str)
}