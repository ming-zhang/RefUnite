var kvs = require('../utils/kvs.js');
var fs = require('fs');
var async = require('async');

// add an activity/status (e.g. someone liked something or someone posts something)
// to the activities table, with all but keyword in params (generated automatically)
// also adds activity keyword to the user's list of activities
// returns activity object along with first_name and last_name of the user
// var addActivity = function(params, callback) {
// 	kvs.postActivity(params, function(err, data) {
// 		if (err) {
// 			console.log("ERROR: ", err);
// 			callback(err, null);
// 		} else {
// 			var activity = data;
// 			kvs.postActivityToUser(params.user, params.keyword, function(err, name) {
// 				if (err) {
// 					callback(err, null);
// 				} else {
// 					// add first and last name to results
// 					activity.first_name = name.first_name;
// 					activity.last_name = name.last_name;
// 					callback(null, activity);
// 				}
// 			});
// 		}
// 	});
// };