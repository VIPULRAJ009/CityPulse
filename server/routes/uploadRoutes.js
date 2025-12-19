const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

// Since we might not have 'uploads' folder created yet, let's create it in server.js or just assume it exists. 
// For now, let's just return a dummy URL because local file upload handling requires static serving setup.
// We'll update server.js to serve 'uploads' statically.

router.post('/', upload.single('image'), (req, res) => {
    // res.send(`/${req.file.path.replace(/\\/g, '/')}`);
    // Returning relative path
    if (req.file) {
        res.send(`/${req.file.path.replace(/\\/g, '/')}`);
    } else {
        res.status(400).send('No file uploaded');
    }
});

module.exports = router;
