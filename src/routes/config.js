const express = require('express')
const router = express.Router()

/**
 * Return UDF config
 */
router.get('/config', (req, res) => {
    res.send({
        supports_search: true,
        supports_group_request: false,
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
        supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M'],
        exchanges: [
            { value: 'L2QQ', name: 'L2QQ', 'desc': 'L2QQ' }
        ],
        symbols_types: [
            { value: 'crypto', name: 'Cryptocurrency' }
        ]
    })
})

/**
 * Return unix time in seconds
 */
router.get('/time', (req, res) => {
    const time = Math.floor(Date.now() / 1000)  // In seconds
    res.set('Content-Type', 'text/plain').send(time.toString())
})

module.exports = router
