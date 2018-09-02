const express = require('express')
const router = express.Router()

/**
 * All symbols
 */
router.get('/symbol_info', (req, res) => {
    const symbols = req.symbols
    res.send({
        name: symbols.map(s => s.symbol),
        description: symbols.map(s => `${s.base} / ${s.quote}`),
        ticker: symbols.map(s => s.symbol),
        currency_code: symbols.map(s => s.quote),
        exchange: 'L2QQ',
        listed_exchange: 'L2QQ',
        type: 'crypto',
        session: '24x7',
        timezone: 'UTC',
        minmov: 1,
        pricescale: symbols.map(s => s.pricescale),
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: true
    })
})

/**
 * Resolve symbols
 */
router.get('/symbols', (req, res, next) => {
    if (!req.query.symbol) {
        throw req.app.error(400, 'Symbol requered')
    }

    const comps = req.query.symbol.split(':')
    const symbolName = (comps.length > 1 ? comps[1] : req.query.symbol).toUpperCase()

    for (let symbol of req.symbols) {
        if (symbol.symbol === symbolName) {
            return res.send({
                name: symbol.symbol,
                description: `${symbol.base} / ${symbol.quote}`,
                ticker: symbol.symbol,
                currency_code: symbol.quote,
                exchange: 'L2QQ',
                listed_exchange: 'L2QQ',
                type: 'crypto',
                session: '24x7',
                timezone: 'UTC',
                minmov: 1,
                pricescale: symbol.pricescale,
                has_intraday: true,
                has_daily: true,
                has_weekly_and_monthly: true
            })
        }
    }

    next(req.app.error(404, 'Unknown symbol'))
})

/**
 * Search symbols
 */
router.get('/search', (req, res) => {
    const query = (req.query.query || '').toUpperCase()
    const symbols = req.symbols.filter(s => s.symbol.indexOf(query) >= 0)
    res.send(symbols.map(s => ({
        symbol: s.symbol,
        full_name: s.symbol,
        description: `${s.base} / ${s.quote}`,
        exchange: 'L2QQ',
        type: 'crypto'
    })))
})

module.exports = router
