const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');

router.get('/', (req, res) => {
    res.render('teacher');
});

router.use(bodyParser.json());

module.exports = router;