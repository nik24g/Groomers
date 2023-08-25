const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public');
  },
  filename: function(req, file, cb) {
    console.log(file);
    cb(null, file.fieldname + '-' + file.originalname.split('.')[0] + '-' + Date.now() + '.' + file.mimetype.split('/')[1]);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  }
});

module.exports = upload;