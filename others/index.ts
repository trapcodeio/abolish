import Abolish, { TypeOfAbolishOrInstance } from "../src/Abolish";
import { AbolishValidator } from "../src/Types";

export function AddValidatorToClassOrInstance(
    abolish: TypeOfAbolishOrInstance,
    validator: AbolishValidator
) {
    if (abolish.hasOwnProperty("validators")) {
        (abolish as InstanceType<typeof Abolish>).addValidator(validator);
    } else if (abolish.hasOwnProperty("addGlobalValidator")) {
        (abolish as typeof Abolish).addGlobalValidator(validator);
    } else {
        throw new Error(`Invalid abolish Class/Instance`);
    }
}
