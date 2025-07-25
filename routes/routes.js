const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const home = require('../controllers/home');
const chatmodel = require('../controllers/chatmodel');
const loginContoller = require('../controllers/loginContoller');
const {authenticateToken} = require('../middleware/authMiddleware');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(express.static('public'));

// Home route
router.get('/', home.mcq);
router.post('/login', loginContoller.login);
router.post('/chat-model', authenticateToken ,chatmodel.chatModel);

module.exports = router;