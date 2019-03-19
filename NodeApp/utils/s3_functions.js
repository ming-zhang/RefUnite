const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

aws.config.update({
  accessKeyId: "AKIAIBIOLFSQYUBEA7XQ",
  secretAccessKey: "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",
  region: 'us-east-1'
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    console.log('file filter got this file')
    console.log(file)
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
  }
}

const upload = multer({
  fileFilter,
  storage: multerS3({
    acl: 'bucket-owner-full-control',
    s3,
    bucket: 'refunite-user-images',
    /* metadata: function (req, file, cb) {
      cb(null, {});
    }, */
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
});

module.exports = upload;