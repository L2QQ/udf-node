/**
 * Documentation for UDF API:
 * https://github.com/tradingview/charting_library/wiki/UDF
 */

require('colors')
console.log('📊 UDF Data Provider Service'.bold.black)

const commanderPort = parseInt(process.env.PORT) || 9040

const express = require('express')
const app = express()

const morgan = require('morgan')
app.use(morgan('tiny'))

const cors = require('cors')
app.use(cors())

app.error = (status, message) => {
    let err = new Error(message)
    err.status = status
    return err
}

app.all('/', (req, res) => {
    res.set('Content-Type', 'text/plain').send("📊 L2QQ UDF Data Provider")
})

app.use((req, res, next) => {
    req.error = app.error

    req.app.symbols.then((symbols) => {
        req.symbols = symbols
        next()
    }).catch((err) => {
        next(err)
    })
})

app.use(require('./src/routes/config'))
app.use(require('./src/routes/symbols'))
app.use(require('./src/routes/history'))

app.use((err, req, res, next) => {
    res.status(err.status || 500).send({
        s: 'error',
        errmsg: err.message
    })
})

app.use((req, res) => {
    res.set('Content-Type', 'text/plain').status(404).send("📊 L2QQ UDF Data Provider")
})

const port = parseInt(process.env.PORT) || 9010
app.listen(port, () => {
    console.log('Listening on:',  String(port).green)
})

const rp = require('request-promise-native')

app.symbols = rp({
    uri: `http://localhost:${commanderPort}`,
    json: true
}).then((config) => {
    app.klines = config.klines
    return config.markets.map(m => ({
        symbol: m.symbol,
        base: m.base,
        quote: m.quote,
        pricescale: m.pricescale
    }))
}).catch(() => {
    process.exit(1)
})
