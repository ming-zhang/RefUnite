var express = require('express');
var router = express.Router();
var path = require('path');
var db = require('../utils/dynamo_functions');

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
  res.sendFile(path.join(__dirname, '../', 'views', 'login.html'));
});

router.get('/dashboard', function(req, res) {
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
  res.json({username: req.session.username});
  //res.set('username', req.session.username);
  //res.end();
  console.log(req.session.username);
  console.log(res.username);
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
