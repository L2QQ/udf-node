const express = require('express')
const router = express.Router()

const rp = require('request-promise-native')

/**
 * Bars
 * @param {number} port
 * @param {string} symbol
 * @param {string} interval
 * @param {number} from unix timestamp (UTC) in milliseconds
 * @param {number} to unix timestamp (UTC) in milliseconds
 */
function klines(port, symbol, interval, from, to) {
    return rp({
        uri: `http://localhost:${port}/ohlc`,
        qs: {
            symbol, interval, from, to
        },
        json: true
    })
}

/**
 * Just for test
 */
const TEST_KLINES_OPEN = Math.floor(Date.now() / (60 * 1000))
function testKlines(port, symbol, interval, from, to) {
    return new Promise((resolve, reject) => {
        from = Math.floor(from / (60 * 1000))
        to = Math.floor(to / (60 * 1000))

        if (TEST_KLINES_OPEN >= from && TEST_KLINES_OPEN <= to) {
            resolve([
                [TEST_KLINES_OPEN * 60 * 1000, 30, 60, 10, 40, 100]
            ])
        } else {
            resolve([])
        }
    })
}

/**
 * Bars
 * @param {string} symbol symbol name or ticker
 * @param {number} from unix timestamp (UTC) in seconds
 * @param {number} to unix timestamp (UTC) in seconds
 * @param {string} resolution
 */
router.get('/history', (req, res, next) => {
    if (!req.query.symbol) {
        throw req.app.error(400, 'Symbol requered')
    }
    if (!req.query.resolution) {
        throw req.app.error(400, 'Resolution requered')
    }
    if (!req.query.from) {
        throw req.app.error(400, 'From requered')
    }
    if (!req.query.to) {
        throw req.app.error(400, 'To requered')
    }

    const interval = {
        '1': '1m',
        '3': '3m',
        '5': '5m',
        '15': '15m',
        '30': '30m',
        '60': '1h',
        '120': '2h',
        '240': '4h',
        '360': '6h',
        '480': '8h',
        '720': '12h',
        'D': '1d',
        '1D': '1d',
        '3D': '3d',
        'W': '1w',
        '1W': '1w',
        'M': '1M',
        '1M': '1M'
    }[req.query.resolution]

    if (!interval) {
        throw req.app.error(400, 'Invalid resolution')
    }

    const from = parseInt(req.query.from) * 1000
    const to = parseInt(req.query.to) * 1000

    if (isNaN(from) || from < 0) {
        throw req.app.error(400, 'from is not unix timestamp')
    }
    if (isNaN(to) || to < 0) {
        throw req.app.error(400, 'to is not unix timestamp')
    }

    const symbol = req.query.symbol.toUpperCase()

    req.app.symbols.then(symbols => {
        if (!symbols.map(s => s.symbol).includes(symbol)) {
            return next(req.app.error(404, 'Unknown symbol'))
        }

        klines(req.app.klines.port, symbol, interval, from, to).then((klines) => {
            if (klines.length === 0) {
                return res.send({
                    s: 'no_data'
                })
            }
    
            res.send({
                s: 'ok',
                t: klines.map(k => Math.floor(k[0] / 1000)),
                c: klines.map(k => parseFloat(k[4])),
                o: klines.map(k => parseFloat(k[1])),
                h: klines.map(k => parseFloat(k[2])),
                l: klines.map(k => parseFloat(k[3])),
                v: klines.map(k => parseFloat(k[5]))
            })
        }).catch((err) => {
            next(err)
        })
    })
})

module.exports = router
