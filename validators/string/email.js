module.exports = {
    name: 'email',
    error: ':param is not a valid email.',
    validator: (email) => {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
    }
}