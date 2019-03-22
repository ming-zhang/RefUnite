const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
var fs = require('fs');
var https = require('https');
var download = require('download-file');
const fr = require('face-recognition');

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

const testImages = () => {
  var params = {Bucket: 'tracetheface'};
  s3.listObjects(params, function(err, data){
    var bucketContents = data.Contents;
      for (var i = 0; i < bucketContents.length; i++){
        var urlParams = {Bucket: 'tracetheface', Key: bucketContents[i].Key};
          s3.getSignedUrl('getObject',urlParams, function(err, url){
            console.log('the url of the image is', url);
            // Save image to folder
            var options = {
              directory: './pictures/',
              filename: 'tester.jpg'
            }
            console.log("Whats up"); 
            //Folder for training data when we have upload functionality working
            download(url, options, function(err){
              console.log("We are inside"); 
              const image = fr.loadImage('./pictures/tester.jpg');
              const detector = fr.FaceDetector();
              const targetSize = 150;
              const faceImages = detector.detectFaces(image, targetSize);
              //Save faceImages to pictures/faces/face_0.jpg ++
              const uniqueId = url.substring(38,45); 
              faceImages.forEach((img, i) => fr.saveImage(`./pictures/faces/${uniqueId}_${i}.png`,img));
              fs.unlinkSync('./pictures/tester.jpg'); 
              if(err) throw err  
            })
          });
      }
  });
}

module.exports = {upload: upload,
                  getImages: testImages
                 };
