var express = require('express');
var router = express.Router();
var path = require('path');
var db = require('../utils/dynamo_functions');
var formidable = require('formidable');
var s3Upload = require('../utils/s3_functions').upload;
var importFresh = require('import-fresh');
var download = require('download-file');
var s3 = require('../utils/s3_functions'); 

const fs = require('fs');
const fr = require('face-recognition');
const rimraf = require('rimraf');

var s3SingleUpload = s3Upload.single('user-photo');

// Connect string to MySQL
var mysql = require('mysql');

var currentFamId; 

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

  if (req.session.username != null) {
      // DOWNLOAD TRAINING DATA
      //s3.getTrainingImages("1")

      //Folder for testing data- Trace The Face Database 
      s3.getImages(); 

      res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
  } else {
      res.redirect('/');
  }

});

router.get('/recognizeId/:id', function(req, res) {
  // TRAIN DATA
  rimraf('./pictures/faces/*', function () { 
      console.log(req.params.id);
      currentFamId = req.params.id; 

      s3.getTrainingImages(req.params.id);  
      res.end();
  }); 


});

router.get('/imageDetails/:id', function(req, res) {
  
  var id = req.params.id; 

    db.getEmailOrLinkFromImageId(id, function(err, data) {
    if (err || !data) {
      console.log("Getting image details err");
      if (err) console.log(err);
    } else {
      console.log("GOT EMAIL/LINK " + data);
      var emailOrLink = data;
      res.json({emailOrLink});
    }
  });
    
});

router.get('/reference', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'reference.html'));
});

router.get('/profile', function(req, res) {
  if (req.session.username != null) {
    res.sendFile(path.join(__dirname, '../', 'views', 'profile.html'));
  } else {
      res.redirect('/');
  }
});

router.get('/family', function(req, res) {
  if (req.session.username != null) {
    res.sendFile(path.join(__dirname, '../', 'views', 'family.html'));
  } else {
      res.redirect('/');
  }
});

//var addFamFriend = function(name, img_ids, relation, gender, age, origin, user_email, callback) {

router.post('/addFamFriend', function(req, res) {
  console.log("in ADDFAMFRIEND");
  console.log(req.body);
  db.addFamFriend(req.body.name, [], req.body.relation, req.body.gender[0], req.body.age[0], req.body.region[0], req.session.username, function(err, data) {
    if (err || !data) {
      console.log("Adding fam friend error");
      if (err) console.log(err);
    } else {
      console.log("Added fam friend to dynamo");
      var addedFamFriendId = data.id;
      res.json({addedFamFriendId});
    }
  });
});

router.post('/addImageToFamFriend', function(req, res) {
  console.log("in addImageToFamFriend");
  console.log(req.body);
  db.addImageToFamFriend(req.body.id, req.body.img_ids, function(err, data) {
    if (err || !data) {
      console.log("addImageToFamFriend error");
      if (err) console.log(err);
    } else {
      console.log("AddImageToFamFriend");
    }
  });
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

router.get('/famfriendids', function(req, res) {
  var username = req.session.username;
  // res.send("Trying to log in");
  console.log("About to check log in");
  var loginResult = "INCOMPLETE";
  db.getUser(username,function(err, data) {
    if (err || !data) {
      console.log('This login is not going well');
      if (err) console.log(err);
      //res.redirect('/');
      //res.sendFile(path.join(__dirname, '../', 'views', 'login.html'));
    } else {
      var famFriendsIds = data.fam_friend_ids; 
      console.log("The ids are: " + famFriendsIds); 

      var famFriends = [];
      // get names for each id
      if (famFriendsIds == null || famFriendsIds == undefined) {
        console.log("IT'S NULL");
      } else {
        for (var i = 0; i < famFriendsIds.length; i++) {
        db.getFamFriend(famFriendsIds[i], function(err2, data2) {
          if (err2 || !data2) {
            console.log('This login is not going well');
            if (err2) console.log(err2);
            //res.redirect('/');
            //res.sendFile(path.join(__dirname, '../', 'views', 'login.html'));
          } else {
              var name = data2.name;
              if (name == null) {
                  name = "null";
              }
              var famFriendObj = {
                id: data2.id,
                name: name
              };

              famFriends.push(famFriendObj);
              if (famFriends.length == famFriendsIds.length) {
                res.json({famFriends});
              }

          }
        });
      }
      }
      

      
      //req.session.username = username;
      //res.redirect('/dashboard');
      //res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
    }
  });
}); 


router.get('/recognize',function(req,res){

  var recognizer = fr.FaceRecognizer();
  /*
  Load Our Previously Saved Train Data
  */
  var modelState = importFresh('../model.json');
    
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
      console.log("----------"); 
      console.log(file); 
      // do stuff for each file
      var image = fr.loadImage(photosinTesting + "/" + file); 
      var detector = fr.FaceDetector();
      var targetSize = 150;
      var faceImage = detector.detectFaces(image, targetSize);
      var faceRects  = detector.locateFaces(image).map(mmodRect => mmodRect.rect);
      var faces = detector.getFacesFromLocations(image, faceRects, 150);
      if (faceRects.length){
          faceRects.forEach((rect,i)=>{
          var predict = recognizer.predictBest(faces[i],0.69);
              console.log(predict.distance); 
              console.log(predict.className); 
            if (predict.className == currentFamId && predict.distance <= 0.6) {
              console.log("The current fam id is:" + currentFamId); 
              listOfSimilarIds.push(file.substring(0, file.length - 4)); 
              
            }
          });
      }

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
    if (err) {
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

router.post('/updateUser', function(req, res) {

  console.log("IN ROUTER.POST.updateUser");
  var email = req.body.username;
  var password = req.body.password;
  var gender = req.body.gender;
  var age = req.body.age;
  var origin = req.body.region;
  var looking_for  = [];
  var img_ids = req.body.imageids; 
  var fam_friend_ids = [];

  db.addUser(email, password, gender, age, origin, looking_for, img_ids, fam_friend_ids, function(err, data) {
    if (err) {
      console.log('This registration is not going well');
      if (err) console.log(err);
      //res.redirect('/');
      //res.sendFile(path.join(__dirname, '../', 'views', 'login.html'));
    } else {
      req.session.username = email;
      res.redirect('/dashboard');
      //res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
    }
  });

});


router.post('/registerUser', function(req, res) {

  console.log("IN ROUTER.POST.registerUser");
  var email = req.body.username;
  var password = req.body.password;
  var gender = req.body.gender;
  var age = req.body.age;
  var origin = req.body.region;
  var looking_for  = [];
  var img_ids = req.body.imageids; 
  var fam_friend_ids = [];

  console.log(email);
  console.log(password);
  console.log(gender);


  db.checkUserExist(email, function(outererror, outerdata) {
    if (outererror) {
      console.log(outererror);
    } else {
      if (outerdata === "true") {
        console.log("OUTERDATA: " + outerdata);
        db.addUser(email, password, gender, age, origin, looking_for, img_ids, fam_friend_ids, function(err, data) {
        if (err) {
          console.log('This registration is not going well');
          if (err) console.log(err);
          //res.redirect('/');
          //res.sendFile(path.join(__dirname, '../', 'views', 'login.html'));
        } else {
          req.session.username = email;
          res.redirect('/dashboard');
          //res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
        }
      });
      } else {
        console.log("OUTERDATA: " + outerdata);
        console.log("user already exists");
        res.status(505).send("505");

      }
    }
  });

  // db.getUser(email, function(outererror, outerdata) {
  //   if (outererror) {
  //     db.addUser(email, password, gender, age, origin, looking_for, img_ids, fam_friend_ids, function(err, data) {
  //       if (err) {
  //         console.log('This registration is not going well');
  //         if (err) console.log(err);
  //         //res.redirect('/');
  //         //res.sendFile(path.join(__dirname, '../', 'views', 'login.html'));
  //       } else {
  //         req.session.username = email;
  //         res.redirect('/dashboard');
  //         //res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
  //       }
  //     });
  //   } else {
  //     console.log("index.js EMAIL IS ALREADY TAKEN");
  //     //res.redirect('/createAccount');
  //   }
  // });

  //var loginResult = "INCOMPLETE";
  

});


router.post('/getuserinfo', function(req, res) {
  console.log("IN /getuserinfo");
  var email = req.body.username;
  db.getUser(email, function(err, data) {
    if (err) {
      console.log("Couldn't get userinfo");
      if (err) console.log(err);
    } else {
      console.log("LOGIN DATA: ");
      console.log(data.gender);
      console.log(data.email);
      req.session.userInfo = data;
      res.json({
        password : data.password,
        gender : data.gender,
        age : data.age,
        origin : data.origin,
        looking_for : data.looking_for,
        fam_friend_ids : data.fam_friend_ids,
        img_ids : data.img_ids
      });
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

router.get('/profileSession', function(req, res) {
  console.log("IN ROUTERGET PROFILESESSION");
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  res.json({username: req.session.username});
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
