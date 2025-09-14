const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const home = require('../controllers/home');
const chatmodel = require('../controllers/chatmodel');
const loginContoller = require('../controllers/loginContoller');
const mcqGenerator = require('../controllers/mcqController');
const rag = require('../controllers/ragController');
const fileUploadController = require('../controllers/fileUploadController');
const { authenticateToken } = require('../middleware/authMiddleware');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/uploads");

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname);

    cb(null, `${originalName}_${timestamp}${ext}`);
  }
});

// ✅ Allow only PDFs
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(express.static('public'));

router.get('/', home.mcq);
router.post('/login', loginContoller.login);
router.post('/chat-model', authenticateToken, chatmodel.chatModel);
router.post('/mcq-generator', authenticateToken, mcqGenerator.mcqGenerator);
router.post('/rag-chatboat', rag.ragChatbotsGenerator);
router.post('/file-upload', upload.single('file'), fileUploadController.fileUpload);

module.exports = router;