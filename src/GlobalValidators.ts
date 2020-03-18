/**
 * @param value
 * @return {string}
 * @private
 */
function trimIfString(value: string | any): string | any {
    return typeof value === 'string' ? value.trim() : value
}

const GlobalValidators: any = {

    must: {
        name: 'must',
        error: ':param is required.',
        validator: (value: any, option: boolean): boolean => {

            if (!option) {
                return true;
            }

            if (typeof value === "undefined" || value === null) {
                return false;
            } else if (typeof value === 'string' || Array.isArray(value)) {
                return value.length > 0
            }

            return true;
        },
    },


    typeof: {
        name: 'typeof',
        error: ':param is not typeOf :option',
        validator: (value: any, option: string | false): boolean => {

            /**
             * If typeof is false then we don't validate this
             */
            if (option === false) return true;

            option = option.toLowerCase();
            if (option === 'array')
                return Array.isArray(value);
            return typeof value === option;
        }
    },


    exact: {
        name: 'exact',
        validator: (value: any, option: any): boolean => {
            return value === option;
        }
    },


    min: {
        name: 'min',
        error: ':param is too small. (Min. :option)',
        validator: (value: any, option: number | string): boolean => {
            const isNotNumber = isNaN(value);

            /**
             * if is string and string is not a valid number,
             * or if value is a valid array
             * we pass the validation to `minLength`
             */
            if ((typeof value === "string" && isNotNumber) || Array.isArray(value))
                return GlobalValidators.minLength.validator(value, option);

            // return false if this is not a number
            if (isNotNumber)
                return false;

            // Parse to Number and compare
            return Number(value) >= Number(option);
        }
    },


    max: {
        name: 'max',
        error: ':param is too big. (Max. :option)',
        validator: (value: any, option: number | string): boolean => {
            const isNotNumber = isNaN(value);

            /**
             * if is string and string is not a valid number,
             * or if value is a valid array
             * we pass the validation to `minLength`
             */
            if ((typeof value === "string" && isNotNumber) || Array.isArray(value))
                return GlobalValidators.maxLength.validator(value, option);

            // return false if this is not a number
            if (isNotNumber)
                return false;

            // Parse to float and compare
            return Number(value) <= Number(option);
        }
    },


    minLength: {
        name: 'minLength',
        error: ':param is too short. (Min. :option characters)',
        validator: (value: any, option: number | string): boolean => {
            if (typeof value !== 'string' && !Array.isArray(value)) return false;

            value = trimIfString(value);
            return value.length >= Number(option);
        }
    },


    maxLength: {
        name: 'maxLength',
        error: ':param is too long. (Max. :option characters)',
        validator: (value: any, option: number | string): boolean => {
            if (typeof value !== 'string' && !Array.isArray(value)) return false;

            value = trimIfString(value);
            return value.length <= Number(option);
        }
    },


    selectMin: {
        name: 'selectMin',
        error: 'Select at-least :option :param.',
        validator: (value: any, option: number | string): boolean => {
            return GlobalValidators.minLength.validator(value, option)
        }
    },


    selectMax: {
        name: 'selectMax',
        error: 'Select at-most :option :param.',
        validator: (value: any, option: number | string): boolean => {
            return GlobalValidators.maxLength.validator(value, option)
        }
    },
};


export = GlobalValidators;
