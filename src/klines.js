const rp = require('request-promise-native')

module.exports = function klines(symbol, interval, from, to, limit) {
    return rp({
        uri: 'http://localhost:9030',
        qs: {
            symbol, interval, from, to, limit
        },
        json: true
    })
}
