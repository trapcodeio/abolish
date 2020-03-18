# Abolish
A Javascript object validator for custom validations

Using the idea of [object-validator-pro](https://github.com/trapcodeio/object-validator-pro) but modern codes and typescript.

For direct browser Installation see [abolish-browser](https://www.npmjs.com/package/abolish-browser)

### Using Package Managers
```sh
npm install abolish
```
Using Yarn
```sh
yarn add abolish
```

### Basic Example
```javascript
const {Abolish} = require('abolish');

const aboy = new Abolish();

aboy.addValidator({
    name: 'isEmail',
    validator: (str) => {
        return str.includes('@')
    },
});

aboy.addValidator({
    name: 'addProtocol',
    validator: (url, option, {modifier}) => {
        if (url.substr(0, option.length) !== option) {
            // add protocol
            modifier.setThis(`${option}://${url}`)
        }
        return true
    }
});

// Object to validate
const form = {
    email: 'appdeveloper@sky.com',
    username: 'john_doe',
    age: 18,
    url: 'wildstream.ng'
};

const validation = aboy.validate(form, {
    '*': 'must|typeOf:string',
    email: 'isEmail',
    username: '*',
    age: 'typeOf:number|max:20',
    url: 'addProtocol:http'
});

console.log({form, validation});
```

#### Result
```
{
  form: {
    email: 'appdeveloper@sky.com',
    username: 'john_doe',
    age: 18,
    url: 'wildstream.ng'
  },
  validation: {
    error: null,
    validated: {
      email: 'appdeveloper@sky.com',
      username: 'john_doe',
      age: 18,
      url: 'http://wildstream.ng'
    }
  }
}
```

Full documentation coming soon
