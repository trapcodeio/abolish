/**
 * Find key or !key
 * @type {RegExp}
 */
const onlyKey = new RegExp(/([!a-zA-Z_*0-9]+)/g);

/**
 * Find key:name
 * @type {RegExp}
 */
const keyColumnVal = new RegExp(/([a-zA-Z_*0-9]+:[a-zA-Z_0-9]+)/g);

/**
 * Find key:"string"
 * @type {RegExp}
 */
const keyColumnValStringDoubleQuotes = new RegExp(/([a-zA-Z_*0-9]+:"[^"]+")/g);

/**
 * Find key:'string'
 * @type {RegExp}
 */
const keyColumnValStringSingleQuotes = new RegExp(/([a-zA-Z_*0-9]+:'[^']+')/g);

/**
 * Find key:`string`
 * @type {RegExp}
 */
const keyColumnValStringGraveAccent = new RegExp(/([a-zA-Z_*0-9]+:`[^`]+`)/g);

/**
 * StringToRules
 * @description
 * Convert string to rules object
 * @param str
 * @constructor
 */
const StringToRules = (str: string): { [key: string]: any } => {
    let s = str.split('|');

    const keyColumnValObj: {
        [key: string]: string | boolean | number
    } = {};

    for (let i = 0; i < s.length; i++) {
        const pair: string = s[i];

        if (pair.match(keyColumnValStringSingleQuotes) || pair.match(keyColumnValStringDoubleQuotes) || pair.match(keyColumnValStringGraveAccent)) {
            const [key, ...value] = pair.split(":");
            let valueToString: string = value.join(':');

            valueToString = valueToString.substr(1);
            valueToString = valueToString.substr(0, value.length - 1);

            keyColumnValObj[key] = valueToString;
        } else if (pair.match(keyColumnVal)) {
            let [key, value] = pair.split(":") as [string, any];

            if (!isNaN(value)) {
                value = Number(value);
            }

            keyColumnValObj[key] = value;
        } else if (pair.match(onlyKey)) {
            /**
             * If key is like "key|" or "!key|"
             * ==> {key: true} or {key: false}
             */
            let key = pair;
            let value = true;

            // if !key set value to false
            if (key.substr(0, 1) === '!') {
                key = key.substr(1);
                value = false;
            }

            keyColumnValObj[key] = value;
        }

    }

    return keyColumnValObj;
};

export = StringToRules