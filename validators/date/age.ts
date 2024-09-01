import type { AbolishValidator } from "../../src/types";

type Gt = `>${number}`;
type Lt = `<${number}`;
type Gte = `>=${number}`;
type Lte = `<=${number}`;
type Eq = `=${number}`;
type Between = `${number}-${number}`;


type AgeString = Gt | Lt | Gte | Lte | Eq | Between;

export = <AbolishValidator>{
    name: "age",
    validator: (v: Date | string, o: AgeString | number | boolean, { error }) => {
        // convert string to date
        if (typeof v === "string") v = new Date(v);
        // check if o is a number
        if (typeof o === "number") o = `=${o}`;
        // check if o is a string
        // noinspection SuspiciousTypeOfGuard
        if (typeof o !== "string")
            return error(`:param validator option is invalid!`).setCode(`invalid.option`);

        // check if v is a valid date
        if (isNaN(v.getTime())) return error(`:param is not a valid Date!`).setCode(`invalid.date`);

        // get current year
        const currentYear = new Date().getFullYear();

        // get age
        const age = currentYear - v.getFullYear();

        // check if age is =
        if (o.startsWith("=")) {
            const ageString = o.slice(1);
            return ageString === String(age)
                ? true
                : error(`:param is not ${ageString} years old!`);
        }
        // check if age is >=
        else if (o.startsWith(">=")) {
            const minAge = Number(o.slice(2));
            return age >= minAge ? true : error(`:param is too young! Must be older than ${minAge}`);
        }
        // check if age is >
        else if (o.startsWith(">")) {
            const minAge = Number(o.slice(1));
            return age > minAge ? true : error(`:param is too young! Must be older than ${minAge}`);
        }
        // check if age is <=
        else if (o.startsWith("<=")) {
            const maxAge = Number(o.slice(2));
            return age <= maxAge ? true : error(`:param is too old! Must be younger than ${maxAge}`);
        }
        // check if age is <
        else if (o.startsWith("<")) {
            const maxAge = Number(o.slice(1));
            return age < maxAge ? true : error(`:param is too old! Must be younger than ${maxAge}`);
        }
        // check if age is between
        else if (o.includes("-")) {
            const [minAge, maxAge] = o.split("-").map(Number);
            return age >= minAge && age <= maxAge
                ? true
                : error(`:param is not between ${minAge} and ${maxAge} years old!`);
        }
        // if none of the above then return error
        else {
            return error(`:param validator option is invalid!`).setCode(`invalid.option`);
        }
    }
};

declare module "../../src/validator" {
    module AvailableValidators {
        interface Options {
            age: AgeString;
        }
    }
}
