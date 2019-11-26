const express = require('express')
const router = module.exports = express.Router()

router.get('/api', (req, res) => res.send('API GOES HERE'))
