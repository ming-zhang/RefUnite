var kvs = require('../utils/kvs.js');
var fs = require('fs');
var async = require('async');

// init kvs (create tables if needed)
kvs.init(function(err, message) {
	if (err) console.log(err);
	else {
		console.log("Initialized tables--ready to query the DB");
	}
});

// add a user to the database with the given params (JSON document)
var addUser = function(email, password, gender, age, origin, looking_for, img_ids, fam_friend_ids, callback) {
	var params = {
		email: email,
		password: password,
		gender: gender,
		age: age,
		origin: origin,
		looking_for: looking_for,
		img_ids: img_ids,
		fam_friend_ids: fam_friend_ids
	}
	kvs.postUser(params, function(err, data) {
		if (err) {
			console.log(err);
			callback(err, null);
		} else {
			console.log("SUCCESS: ", data);
			callback(null, "OK");
		}
	});
};

// get the info in the form of a JSON object for a user
var getUser = function(email, callback) {
	kvs.retrieveUser(email, function(err, info) {
		if (err) {
			console.log(err);
			callback(err, null);
		} else {
			console.log("got user " + info.email)
			callback(null, info);
		}
	});
}

// check the login parameters (username and password) to see if valid
var checkLogin = function(email, password, callback) {
	kvs.checkPassword(email, password, function(err, data) {
		if (err) {
			console.log("IT'S NOT FINE Error: ", err);
			// callback with error
			callback(err, null);
		} else {
			// callback with success
			console.log("IT'S FINE");
			callback(null, "OK");
		}
	});
};

// add a famFriend to the database with the given params (JSON document)
var addFamFriend = function(img_ids, relation, gender, age, origin, user_email, callback) {
	var params = {
		img_ids: img_ids,
		relation: relation,
		gender: gender,
		age: age,
		origin: origin,
		user_email: user_email
	}
	kvs.postFamFriend(params, function(err, data) {
		if (err) {
			console.log(err);
			callback(err, null);
		} else {
			// add famFriend id to User
			kvs.addFamFriendToUser(user_email, data.id, function(err2, data2) {
				if (err2) {
					console.log(err2);
					callback(err2, null);
				} else {
					console.log("Added famFriend to " + user_email);
					callback(null, "OK");
				}
			});
		}
	});
};


// get the info in the form of a JSON object for a famFriend
var getFamFriend = function(email, callback) {
	kvs.retrieveFamFriend(email, function(err, info) {
		if (err) {
			console.log(err);
			callback(err, null);
		} else {
			console.log("got fam friend ")
			callback(null, info);
		}
	});
}

var database = {
	addUser: addUser,
	getUser: getUser,
	getFamFriend: getFamFriend,
	addFamFriend: addFamFriend,
	checkLogin: checkLogin
}

module.exports = database;