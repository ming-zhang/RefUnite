var express = require('express');
var router = express.Router();
var path = require('path');
var db = require('../utils/dynamo_functions');
var formidable = require('formidable');
var s3Upload = require('../utils/s3_functions').upload;

var download = require('download-file');
var s3 = require('../utils/s3_functions'); 

const fs = require('fs');
const fr = require('face-recognition');

var s3SingleUpload = s3Upload.single('user-photo');

// Connect string to MySQL
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'fling.seas.upenn.edu',
  user: 'carlsonk',
  password: 'flingpassw0rd',
  database: 'carlsonk'
});

connection.connect(function(err) {
  if (err) {
    console.log("Error Connection to DB" + err);
    return;
  }
  console.log("Connection established...");
});

/* GET home page. */
router.get('/', function(req, res) {
  //res.sendFile(path.join(__dirname, '../', 'views', 'login.html'));
  var options = {
    headers: {
        'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
    }
  };
  res.sendFile(path.join(__dirname, '../', 'views', 'login.html'), options);
});

router.get('/dashboard', function(req, res) {

  // DOWNLOAD TRAINING DATA
  s3.getTrainingImages("1")

  //Folder for testing data- Trace The Face Database 
  s3.getImages(); 

  res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
});

router.get('/reference', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'reference.html'));
});

router.get('/profile', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'profile.html'));
});

router.get('/family', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'family.html'));
});

router.get('/createAccount', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'createaccount.html'));
});

router.get('/createAccount_profileDetails', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'createacct_profiledetails.html'));
});

router.get('/createAccount_photoUpload', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'createacct_photoupload.html'));
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
  var listOfSimilarIds = []; 
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
          if(predict.className == "1" && predict.distance <= 0.6) {
            //const win= new fr.ImageWindow();
            //win.setImage(image);
            //win.addOverlay(rect);
            //win.addOverlay(rect, `${predict.className} (${predict.distance})`);
            //console.log(file); 
            listOfSimilarIds.push(file.substring(0, file.length - 4)); 
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
  //for each id in listOfSimilarIds, do a router.get? some sort of get request.
  //then put these into a json response
  res.json(listOfSimilarIds);
  });
});



// To add a new page, use the templete below
/*
router.get('/routeName', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'fileName.html'));
});
*/
/*var checkLogin = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.checkLogin(username, password, function(err, data) {
    if (err) {
      res.redirect('/');
    } else if (data) {
      req.session.username = username;
      res.redirect('/dashboard.html');
    } else {
      res.redirect('/');
    }
  });

};*/


//router.post('/checklogin', router.checkLogin);
router.post('/checklogin', function(req, res) {
  console.log("IN ROUTER.POST.checklogin");
  var username = req.body.username;
  var password = req.body.password;
  // res.send("Trying to log in");
  console.log("About to check log in");
  var loginResult = "INCOMPLETE";
  db.checkLogin(username, password, function(err, data) {
    if (err || !data) {
      console.log('This login is not going well');
      if (err) console.log(err);
      //res.redirect('/');
      //res.sendFile(path.join(__dirname, '../', 'views', 'login.html'));
    } else {
      req.session.username = username;
      res.redirect('/dashboard');
      //res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
    }
  });

});

router.get('/dashboardSession', function(req, res) {
  console.log("IN ROUTERGET DASHBOARDSESSION");
  //res.username = req.session.username;
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  res.json({username: req.session.username});
  //res.set('username', req.session.username);
  //res.end();
  console.log(req.session.username);
  console.log(res.username);
});

router.get('/logoutSession', function(req, res) {
  console.log("IN ROUTERGET logoutSession");
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  //res.username = req.session.username;
  //res.logout();
  req.session.destroy(function(err){
     if(err){
        console.log(err);
     }else{
        //console.log(req.session.username);
        //req.end();

        res.redirect('/');
        //res.sendFile(path.join(__dirname, '../', 'views', 'login.html'));
     }
  });
  //res.set('username', req.session.username);
  //res.end();
  //console.log(req.session.username);
  //console.log(res.username);
});


// Login uses POST request
/*router.post('/login', function(req, res) {
  // use console.log() as print() in case you want to debug, example below:
  // console.log(req.body); will show the print result in your terminal

  // req.body contains the json data sent from the loginController
  // e.g. to get username, use req.body.username
  console.log("IN ROUTER.POST");
  db.checkLogin(req.body.loginUsername, req.body.loginPassword, function(e, n) {
    if (e == null) {
      console.log("TOTALLY FINE");
    } else {
      console.log("THERES AN ERROR");
    }
  });
  console.log(loginResult);

  
});*/


/*var query = "INSERT INTO carlsonk.User(username, password) VALUES ( '" + req.body.username + "', '" + req.body.password + "') ON DUPLICATE KEY UPDATE password = '" + req.body.password + "';"; // Write your query here and uncomment line 21 in javascripts/app.js
  connection.query(query, function(err, rows, fields) {
    console.log("rows", rows);
    console.log("fields", fields);
    if (err) console.log('insert error: ', err);
    else {
      res.json({
        result: 'success'
      });
    }
  });*/

// /* S3 Route */
router.post('/image-upload', s3SingleUpload, (req, res, next) => {
  // const file = req.file
  // if (!file) {
  //   const error = new Error('Please upload a file')
  //   error.httpStatusCode = 400
  //   return next(error)
  // }
  //   res.send(file)
  
});

// template for GET requests
/*
router.get('/routeName/:customParameter', function(req, res) {

  var myData = req.params.customParameter;    // if you have a custom parameter
  var query = '';

  // console.log(query);

  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
});
*/

module.exports = router;
