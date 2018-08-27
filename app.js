const express = require('express')
const app = express()

const morgan = require('morgan')
app.use(morgan('tiny'))

app.get('/config', (req, res) => {
    res.send({})
})

app.get('/symbols', (req, res) => {
    res.send({})
})

app.get('/search', (req, res) => {
    res.send({})
})

app.get('/history', (req, res) => {
    res.send({})
})

app.get('/time', (req, res) => {
    res.send({})
})

app.listen(9010, () => {
    console.log('Listen')
})
