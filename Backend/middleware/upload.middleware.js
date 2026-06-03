const multer = require('multer');
const path = require('path');

// Configure where and how files are stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

// 🔓 TEMPORARILY ALLOW ALL FILE TYPES (for testing)
const fileFilter = (req, file, cb) => {
  cb(null, true); // accept any file
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;