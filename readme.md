# Abolish

A Javascript object validator for custom validations

Using the idea of [object-validator-pro](https://github.com/trapcodeio/object-validator-pro) but modern codes and
typescript.

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

const abolish = new Abolish();

// Use abolish email validator
const EmailValidator = require('abolish/validators/string/email');
abolish.addValidator(EmailValidator);

// Add Custom Validtor
abolish.addValidator({
  name: 'addProtocol',
  validator: (url, option, {modifier}) => {
    // Check if url does not have required protocol
    if (url.substr(0, option.length) !== option) {
      // Add protocol
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

const [error, validated] = abolish.validate(form, {
  $: 'required|typeOf:string', // $ or '*' is considered as wildcard
  email: 'isEmail',
  username: '*',
  age: 'typeOf:number|max:20',
  url: 'addProtocol:http'
});

console.log({form, validation: {error, validated}});
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
