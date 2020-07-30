module.exports = {
    name: 'alphaNumeric',
    error: ':param allows only AlphaNumeric characters.',
    validator: (str) => (new RegExp(/^[a-z0-9]+$/i)).test(str)
}