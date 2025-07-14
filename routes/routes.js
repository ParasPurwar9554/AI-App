const express = require('express');
const router = express.Router();
const home = require('../controllers/home');

// Home route
router.get('/', home.mcq);

module.exports = router;