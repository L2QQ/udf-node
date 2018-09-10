const express = require('express')
const router = express.Router()

/**
 * Bars
 * @param {string} symbol symbol name or ticker
 * @param {number} from unix timestamp (UTC) in seconds
 * @param {number} to unix timestamp (UTC) in seconds
 * @param {string} resolution
 */
router.get('/history', (req, res, next) => {
    if (!req.query.symbol) {
        throw req.error(400, 'Symbol requered')
    }
    if (!req.query.resolution) {
        throw req.error(400, 'Resolution requered')
    }
    if (!req.query.from) {
        throw req.error(400, 'From requered')
    }
    if (!req.query.to) {
        throw req.error(400, 'To requered')
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
        throw req.error(400, 'Invalid resolution')
    }

    const from = parseInt(req.query.from) * 1000
    const to = parseInt(req.query.to) * 1000

    if (isNaN(from) || from < 0) {
        throw req.error(400, 'from is not unix timestamp')
    }
    if (isNaN(to) || to < 0) {
        throw req.error(400, 'to is not unix timestamp')
    }

    const symbol = req.query.symbol.toUpperCase()

    if (!req.symbols.map(s => s.symbol).includes(symbol)) {
        return next(req.error(404, 'Unknown symbol'))
    }

    req.ohlcv.bars(symbol, interval, from, to).then((bars) => {
        if (bars.length === 0) {
            return res.send({
                s: 'no_data'
            })
        }

        res.send({
            s: 'ok',
            t: bars.map(b => Math.floor(b[0] / 1000)),
            c: bars.map(b => parseFloat(b[4])),
            o: bars.map(b => parseFloat(b[1])),
            h: bars.map(b => parseFloat(b[2])),
            l: bars.map(b => parseFloat(b[3])),
            v: bars.map(b => parseFloat(b[5]))
        })
    }).catch((err) => {
        next(err)
    })
})

module.exports = router
