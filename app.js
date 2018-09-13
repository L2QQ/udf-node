/**
 * Documentation for UDF API:
 * https://github.com/tradingview/charting_library/wiki/UDF
 */

require('colors')
console.log('📊 UDF Data Provider Service'.bold)

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

const OHLCV = require('../services-node/src/wrappers/ohlcv')
const Commander = require('../services-node/src/wrappers/commander')

const commander = new Commander(parseInt(process.env.COMMANDER_PORT) || 9040)
commander.on('config', (config) => {
    console.log('Config changed'.magenta)
    app.ohlcv = new OHLCV(config.services.ohlcv.port)
    app.symbols = config.markets.map(m => ({
        symbol: m.symbol,
        base: m.base,
        quote: m.quote,
        pricescale: m.pricescale
    }))
})

app.use((req, res, next) => {
    req.error = app.error
    req.symbols = app.symbols
    req.ohlcv = app.ohlcv
    next()
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

commander.once('config', () => {
    console.log('Took config once'.red)
    const port = parseInt(process.env.PORT) || 9010
    app.listen(port, () => {
        console.log('Listening on:', String(port).green, '\n')
    })
})
