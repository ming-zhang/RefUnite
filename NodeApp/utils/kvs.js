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
var AWS = vogels.AWS;
AWS.config.loadFromPath('./config.json');
var dynamodb = new AWS.DynamoDB();
vogels.dynamoDriver(dynamodb);


if (!AWS.config.credentials || !AWS.config.credentials.accessKeyId)
    throw 'Need to update config.json to specify your access key!';

// check if init has been called first
hasInit = false;

// current indices for each table with autogenerated keyword (updated in init)
var userIdx = -1;
var famFriendIdx = -1;

// User schema defintion
var users = vogels.define('user', {
    hashKey : 'email',
    schema : {
        email : joi.string(),
        password : joi.string(),
        gender: joi.string(),
        age : joi.string(),
        origin : joi.string(),
        looking_for : vogels.types.stringSet(),
        img_ids : vogels.types.stringSet(),
        fam_friend_ids : vogels.types.stringSet()
    }
});

// FamFriend schema
var famFriends = vogels.define('famFriend', {
    hashKey : 'id',
    schema : {
        id : vogels.types.uuid(),
        name: joi.string(),
        img_ids : vogels.types.stringSet(),
        relation: joi.string(),
        gender: joi.string(),
        age : joi.string(),
        origin : joi.string(),
        user_email : joi.string(),
    }
});

// called from init to initialize the indexes
var initIdxs = function(callback) {
    // get next keyword for each table with autogenerated keywords
    async.parallel({
        one: function(parallelCb) {
            users.scan().loadAll().exec(function(err, data) {
                if (err) console.log(err);
                else {
                    commentIdx = data.Count + 1;
                    console.log("USER INDEX IS: " + commentIdx);
                    parallelCb(null, {err: err, data: data});
                }
            });
        },
        two: function(parallelCb) {
            famFriends.scan().loadAll().exec(function(err, data) {
                if (err) console.log(err);
                else {
                    activityIdx = data.Count + 1;
                    console.log("FAMFRIEND INDEX IS: " + activityIdx);
                    parallelCb(null, {err: err, data: data});
                }
            });
        }
    }, function(err, data) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, "OK");
        }
    });
};

// call this before adding/updating/deleting tables
var init = function(callback) {
    // create tables from definitions above
    console.log("Initializing tables...");
    vogels.createTables(function(err) {
        if (err) {
            console.log('Error creating tables: ' + err);
            callback(err, null);
        } else {
            console.log('Tables have been created');

            // tables have now been intialized
            hasInit = true;

            // initialize the indexes for tables
            initIdxs(function(err, res) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, "OK");
                }
            });

        }
    });
};

// Add user to the users table
var postUser = function(params, callback) {
    if (hasInit) {
        console.log("in post user kvs")
        users.create(params, function(err, data) {
            if (err) {
                console.log(err);
                callback("Issue querying the database", null);
            } else {
                callback(null, "OK");
            }
        });
    } else {
        console.log("Tables not yet initialized--call init first!");
        callback("Table not yet initialized--call init first!", null);
    }
};

// get the user info as a JSON object for a user
var retrieveUser = function(email, callback) {
    if (hasInit) {
        // get attributes for user (except for password)
        users.get(email, function(err, data) {
            var attrs = data.attrs;
            var info = {
                email : attrs.email,
                gender : attrs.gender,
                age : attrs.age,
                origin : attrs.origin,
                looking_for : attrs.looking_for,
                img_ids : attrs.img_ids,
                fam_friend_ids : attrs.fam_friend_ids
            };
            callback(null, data.attrs); //info
        });
    } else {
        console.log("Tables not yet initialized--call init first!");
        callback("Table not yet initialized--call init first!", null);
    }
};

// Add famFriend to the famFriend table
var postFamFriend = function(params, callback) {
    if (hasInit) {
        famFriends.create(params, function(err, data) {
            if (err) {
                console.log(err);
                callback("Issue querying the database", null);
            } else {
                callback(null, data.attrs);
            }
        });
    } else {
        console.log("Tables not yet initialized--call init first!");
        callback("Table not yet initialized--call init first!", null);
    }
};

// get the famFriend info as a JSON object for a FamFriend
var retrieveFamFriend = function(id, callback) {
    if (hasInit) {
        // get attributes for famFriend
        famFriends.get(id, function(err, data) {
            var attrs = data.attrs;
            var info = {
                id : attrs.id,
                img_ids : attrs.img_ids,
                relation: attrs.relation,
                gender: attrs.gender,
                age : attrs.age,
                origin : attrs.origin,
                user_email : attrs.user_email
            };
            callback(null, info);
        });
    } else {
        console.log("Tables not yet initialized--call init first!");
        callback("Table not yet initialized--call init first!", null);
    }
};

var addFamFriendToUser = function(user_email, fam_friend_id, callback) {
    if (hasInit) {
        users.update({email: user_email, fam_friend_ids : {$add : fam_friend_id}}, function(err, data) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                callback(null, "OK");
            }
        });
    } else {
        console.log("Tables not yet initialized--call init first!");
        callback("Table not yet initialized--call init first!", null);
    }
};

// check if a user exists and password matches
var checkPassword = function(email, password, callback) {
    // query the users table for the email and matching password and execute callback
    //var hashedPassword = SHA3(password).toString();
    if (hasInit) {
        // get attributes for user (except for password)
        users.get(email, function(err, data) {
            if (err || !data) {
                console.log("Log in is not going well in kvs");
                if (err) console.log(err);
            } else {
                var attrs = data.attrs;
                console.log("ATTRS:");
                console.log(attrs);
                if (attrs.password != password) {
                    return callback("Password does not match", "WRONG");
                }
            }
            callback(err, data);
        });
    } else {
        console.log("Tables not yet initialized--call init first!");
        callback("Table not yet initialized--call init first!", null);
    }
};

var updateProfile = function(currUser, age, gender, origin, callback) {
    if (hasInit) {
        users.update({email: currUser, age: age, gender: gender, origin: origin}, 
            function(err, data) {
            if (err) {
                console.log(err);
                console.log("errored in kvs")
                callback(err, null);
            } else {
                callback(null, "OK");
            }
        });
    } else {
        console.log("Tables not yet initialized--call init first!");
        callback("Table not yet initialized--call init first!", null);
    }
};

var kvs = {
    init: init,
    postUser: postUser,
    retrieveUser: retrieveUser,
    postFamFriend: postFamFriend,
    retrieveFamFriend: retrieveFamFriend,
    checkPassword: checkPassword,
    addFamFriendToUser: addFamFriendToUser,
    updateProfile: updateProfile
}

module.exports = kvs;
