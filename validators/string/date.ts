import {AbolishValidator} from "../../src/Types";

export = <AbolishValidator>{
    name: 'date',
    validator: (v: any, o: any, {modifier}) => {
        if (v instanceof Date) {
            return true
        } else if (typeof v === "string") {
            const date = new Date(v);
            const isDate = !isNaN(date.getTime())
            if (isDate && o?.cast) modifier.setThis(date);
            return isDate
        } else {
            return false
        }
    },
    error: `:param is not a valid Date!`
}