/**
 * Interface for interacting with DynamoDB tables using vogels
 *
 * Supports all schemas for tables used in implementation, including
 * variable length table columns and multi-attribute calues
 *
 * See https://github.com/ryanfitz/vogels for documentation on vogels queries
 */

var vogels = require('vogels');
var async = require('async');
var joi = require('joi');
var SHA3 = require("crypto-js/sha3");
var AWS = vogels.AWS;
AWS.config.loadFromPath('./config.json');
var dynamodb = new AWS.DynamoDB();
vogels.dynamoDriver(dynamodb);


if (!AWS.config.credentials || !AWS.config.credentials.accessKeyId)
    throw 'Need to update config.json to specify your access key!';


// schema defintions
var users = vogels.define('user', {
    hashKey : 'email',
    schema : {
        email : joi.string(),
        password : joi.string(),
        gender: joi.string(),
        age : joi.number(),
        origin : joi.string(),
        looking_for : vogels.types.stringSet(),
        img_ids : vogels.types.stringSet(),
    }
});

// schema defintions
var famFriends = vogels.define('famFriends', {
    hashKey : 'id',
    schema : {
        id : vogels.types.uuid(),
        img_ids : vogels.types.stringSet(),
        relation: joi.string(),
        gender: joi.string(),
        age : joi.number(),
        origin : joi.string(),
    }
});

var addUser = function(email, password, gender, age, origin, looking_for, img_ids) {
    params = {};
    params.email = email;
    params.password = password;
    params.gender = gender;
    params.age = age;
    
};

// post a status to the activities table
// params contains all attributes for table
// var postActivity = function(params, callback) {
//     if (hasInit) {
//         // autogenerate key and update activity index
//         params.keyword = activityIdx++;
//         activities.create(params, function(err, data) {
//             if (err) {
//                 console.log(err);
//                 callback("Issue querying the database", null);
//             } else {
//                 activities.get(params.keyword, function(err, data) {
//                     if(err) {
//                         console.log("ERR: " + err);
//                         callback(err, null);
//                     } else {
//                         callback(null, data.attrs);
//                     }
//                 });
//             }
//         });
//     } else {
//         console.log("Tables not yet initialized--call init first!");
//         callback("Table not yet initialized--call init first!", null);
//     }
// };