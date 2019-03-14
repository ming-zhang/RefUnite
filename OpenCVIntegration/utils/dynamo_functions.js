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

// add a famFriend to the database with the given params (JSON document)
var addFamFriend = function(img_ids, relation, gender, age, origin, img_ids) {
	var params = {
		img_ids: img_ids,
		relation: relation,
		gender: gender,
		age: age,
		origin: origin,
		img_ids: img_ids
	}
	kvs.postFamFriend(params, function(err, data) {
		if (err) {
			console.log(err);
			callback(err, null);
		} else {
			console.log("SUCCESS: ", data);
			callback(null, "OK");
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
	addFamFriend: addFamFriend
}

module.exports = database;