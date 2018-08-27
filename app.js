const express = require('express')
const app = express()

const morgan = require('morgan')
app.use(morgan('tiny'))

app.get('/config', (req, res) => {
    res.send({
        supports_search: true,
        supports_group_request: false,
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
        supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M']
    })
})

app.get('/symbols', (req, res) => {
    res.send({})
})

app.get('/search', (req, res) => {
    res.send({})
})

const klines = require('./src/klines')

app.get('/history', (req, res) => {
    klines().then(klines => {
        res.send({
            s: 'ok',
            t: klines.map(k => Math.floor(k[0] / 1000)),
            c: klines.map(k => parseFloat(k[4])),
            o: klines.map(k => parseFloat(k[1])),
            h: klines.map(k => parseFloat(k[2])),
            l: klines.map(k => parseFloat(k[3])),
            v: klines.map(k => parseFloat(k[5]))
        })
    })
})

app.get('/time', (req, res) => {
    const time = Math.floor(Date.now() / 1000)
    res.send(time.toString())
})

const rp = require('request-promise-native')
rp('http://localhost:9040/config', { json: true }).then((config) => {
    app.listen(9010, () => {
        console.log('Listen')
    })
}).catch(err => {
    console.error(err)
})
