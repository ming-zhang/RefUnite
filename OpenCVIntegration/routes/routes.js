var express = require('express');
var router = express.Router();
var download = require('download-file');
var s3 = require('../utils/s3_functions'); 

const path = require('path');
const fs = require('fs');
const fr = require('face-recognition');

// For New Data Set ,Uncomment the code below to :
// 1.Detect Faces from complete images
// 2.Save 150x150 faces with class names for each
// 3.Use Some of these to train the classifier
// 4.Save Trained Data into Model.json
// 5.Test for remaining faces


/*
Below Works Perfectly to Extract 150x150 faces from images and saves them to faces
*///Manually change this path
//console.log("Meow");  

console.log("Hello"); 
//Folder for training data when we have upload functionality working
/*
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
*/

console.log("WE are after"); 

// DOWNLOAD TRAINING DATA
s3.getTrainingImages("1")

//Folder for testing data- Trace The Face Database 
s3.getImages(); 
/*
Now Manually Rename the faces from [face_1].png to [CorrectName]_1.png
*/

/*
Optional
Open Xquartz for below 3 lines to display mesh of faces
*/
// const win = new fr.ImageWindow();
// win.setImage(fr.tileImages(faceImages));
// fr.hitEnterToContinue();


/*
We have 4-5 pictures for each character
we use 4 to train and rest to test our training
*/


/*
Load Our Previously Saved Train Data
*/
 //const modelState = require('../model.json');
 //recognizer.load(modelState);



//Recognizing New Faces

// const errors = classNames.map(_ => []);
// testDataByClass.forEach((faces, label) => {
//   const name = classNames[label];
//   console.log();
//   console.log('testing %s', name);
//   faces.forEach((face, i) => {
//     const prediction = recognizer.predictBest(face);
//     console.log('%s (%s)', prediction.className, prediction.distance);
//
//     // count number of wrong classifications
//     if (prediction.className !== name) {
//       errors[label] = errors[label] + 1;
//     }
//   });
// });

/*
print the result
*/
// const result = classNames.map((className, label) => {
//   const numTestFaces = testDataByClass[label].length;
//   const numCorrect = numTestFaces - errors[label].length;
//   const accuracy = parseInt((numCorrect / numTestFaces) * 10000) / 100;
//   return `${className} ( ${accuracy}% ) : ${numCorrect} of ${numTestFaces} faces have been recognized correctly`;
// })
// console.log('result:');
// console.log(result);


router.get('/',function(req, res){
  res.render('index');
});

router.get('/recognize',function(req,res){

  const recognizer = fr.FaceRecognizer();
  /*
  Load Our Previously Saved Train Data
  */
  const modelState = require('../model.json');
  recognizer.load(modelState);

  /*
  Detect Face From Image
  */
 var photosinTesting = "./pictures/testing"
 fs.readdir(photosinTesting, function (err, files) {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }

  files.forEach(function (file, index) {
    console.log(file); 
    // do stuff for each file
  const image = fr.loadImage(photosinTesting + "/" + file); 
  const detector = fr.FaceDetector();
  const targetSize = 150;
  const faceImage = detector.detectFaces(image, targetSize);
  const faceRects  = detector.locateFaces(image).map(mmodRect => mmodRect.rect);
  const faces = detector.getFacesFromLocations(image, faceRects, 150);

  if(faceRects.length){
      faceRects.forEach((rect,i)=>{
      const predict = recognizer.predictBest(faces[i],0.69);
      if(predict.className == "1" && predict.distance <= 0.6 ) {
        const win= new fr.ImageWindow();
        win.setImage(image);
        win.addOverlay(rect);
        win.addOverlay(rect, `${predict.className} (${predict.distance})`);
        //console.log(file); 
        console.log(predict.distance); 
        console.log(predict.className); 
      }
  });

    // fr.hitEnterToContinue();
  }

  /*
  Send Output for one face to html page
  */
 /*
  if(faceImage.length){
  const predictions=recognizer.predict(faceImage[0]);
  res.send(predictions);
  }
  else{
    res.status(400).json({msg:'Could Not Detect Face, Please try another picture'});
  }
  */
    });
  });
});

module.exports = router;