const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, name);
  }
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const url = `http://localhost:4000/uploads/${req.file.filename}`;
  res.json({ success: true, url, name: req.file.originalname });
});

app.use('/uploads', express.static(uploadDir));

app.get('/', (req, res) => res.send('FBLA Member App - Upload Server'));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Upload server listening on', port));
