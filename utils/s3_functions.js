const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
var fs = require('fs');
var https = require('https');
var download = require('download-file');
const fr = require('face-recognition');
const dynamo = require('./dynamo_functions');
const path = require('path');


aws.config.update({
  accessKeyId: "AKIAIBIOLFSQYUBEA7XQ",
  secretAccessKey: "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",
  region: 'us-east-1'
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
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
      cb(null, file.originalname)
    }
  })
});

const testImages = () => {
  var params = {Bucket: 'tracethefacetest'};
  s3.listObjects(params, function(err, data){
    var bucketContents = data.Contents;
      for (var i = 0; i < bucketContents.length; i++){
        var urlParams = {Bucket: 'tracethefacetest', Key: bucketContents[i].Key};
          s3.getSignedUrl('getObject',urlParams, function(err, url){
            console.log('the url of the image is', url);
            // Save image to folder
            const startingIndex = url.lastIndexOf("/"); 
            const endingIndex = url.lastIndexOf("."); 
            const uniqueId = url.substring(startingIndex + 1, endingIndex); 
            var options = {
              directory: './pictures/testing',
              filename: uniqueId + ".jpg"
            }
            console.log("Whats up"); 
            //Folder for training data when we have upload functionality working
            download(url, options, function(err){
              if(err) throw err  
            })
          });
      }
  });
}

const getTrainingImages = (famFriendId) => {
  var params = {Bucket: 'refunite-famfriend-images'};
  // Get img_ids from dynamo for famfriend
  console.log("My name is Reeham"); 
  dynamo.getFamFriend(famFriendId, function(err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log("got fam friend ")
      var ids = info.img_ids

      // Download each img into /pictures/faces folder
      var flag = true; 
      for (var i = 0; i < ids.length; i++) {
          var url = "https://s3.amazonaws.com/refunite-famfriend-images/" + ids[i] + ".jpg"
          console.log(url); 
          var options = {
                  directory: './pictures/faces',
                  filename: famFriendId + "_" + i + ".jpg"
                }
        console.log(ids[i]);

          (function(i) {
 
                console.log("This absolutely sucks- before if statement"); 
                  console.log("idx2 " + i);

            download(url, options, function(err) {
              if(err) throw err

              setTimeout(function(){
              if(i == ids.length - 1 && flag) {
                // CROP IMAGE
                for (var k = 0; k < ids.length; k++) {

                  (function(k) {
                    console.log("CROP " + k);
               
                  const image = fr.loadImage('./pictures/faces/' + famFriendId + "_" + k + ".jpg");
                            const detector = fr.FaceDetector();
                            const targetSize = 150;
                            const faceImages = detector.detectFaces(image, targetSize);
                            //Save faceImages to pictures/faces/face_0.jpg ++
                            faceImages.forEach((img, j) => fr.saveImage('./pictures/faces/' + famFriendId + "_" + k + ".jpg",img));
                
               
                })(k);

                }

                
                console.log("we are inside if statement"); 
                flag = false; 
                const dataPath = path.resolve('./pictures/faces');
                //Our 'database' (add the back-end here)
      
              //ClassNames has to be changed to our uniqueIdentifiers for famFriends 
              //const uniqueId = url.substring(38,45);
                  const classNames = [famFriendId];
                  const allFiles = fs.readdirSync(dataPath);
                  const imagesByClass = classNames.map(c =>
                    allFiles
                      .filter(f => f.includes(c))
                      .map(f => path.join(dataPath, f))
                      .map(fp => fr.loadImage(fp))
                  );
                  
                  //Maybe change later to 4 
                  const numTrainingFaces = 3;
                  const trainDataByClass = imagesByClass.map(imgs => imgs.slice(0, numTrainingFaces));
                  const testDataByClass = imagesByClass.map(imgs => imgs.slice(numTrainingFaces));
                  
                  /*
                  Train our recognizer
                  */
                 console.log("Training has begun"); 
                  const recognizer = fr.FaceRecognizer();
                  
                  trainDataByClass.forEach((faces, label) => {
                    const name = classNames[label];
                    recognizer.addFaces(faces, name);
                  });
                  
                  //  console.log(recognizer.getFaceDescriptors); 
                  
                  /*
                  Save Our Trained Data
                  */
                  const modelState = recognizer.serialize();
                  fs.writeFileSync('model.json', JSON.stringify(modelState));  
                  console.log("Model json is being updated");     
                          }
                        },5000);
                        });
             
              })(i);

         

              console.log("Download is done"); 
      }

    }
  });


              

}

module.exports = {upload: upload,
                  getImages: testImages,
                  getTrainingImages: getTrainingImages
                 };