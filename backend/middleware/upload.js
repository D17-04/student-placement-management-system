const multer = require("multer");
const path = require("path");
const fs = require("fs");

const directory = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });

const storage = multer.diskStorage({
  destination: directory,
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
  }
});

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  }
});
