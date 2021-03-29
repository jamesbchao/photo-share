"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');
var Record = require('./schema/record.js')

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
const fs = require('fs');
//const { response } = require('express');
//const { ids } = require('webpack');
var app = express();

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
//var cs142models = require('./modelData/photoApp.js').cs142models;
//const { LensTwoTone, LeakRemoveTwoTone, LensOutlined } = require('@material-ui/icons');
//const { left } = require('@popperjs/core');

mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    login_name: '',
    cookie: { secure: false }
}));


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (request.session.login_name === null) {
        response.status(401).send('Unauthorized');
    }
    User.find({}, function (err, userlist) {
        if (err) {
            console.error('Doing /user/list error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (userlist.length === 0) {
            response.status(400).send('Missing User List');
            return;
        }
        let retVal = JSON.parse(JSON.stringify(userlist));
        retVal.forEach(function(user) {
            delete user.location;
            delete user.description;
            delete user.occupation;
            delete user.__v;
        });


        response.end(JSON.stringify(retVal));
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (request.session.login_name === null) {
        response.status(401).send('Unauthorized');
    }
    var id = request.params.id;
    User.findOne({_id: id}, function (err, user) {
        if (err) {
            console.error('Doing /user/:id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user === null) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        const retVal = JSON.parse(JSON.stringify(user));
        delete retVal.__v;
        response.status(200).send(JSON.stringify(retVal));
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (request.session.login_name === null) {
        response.status(401).send('Unauthorized');
    }
    var id = request.params.id;
    Photo.find({user_id: id}, function (err, photos) {
        if (err) {
            console.error('Doing /photosOfUser/:id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        /*
        if (photos.length === 0) {
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(400).send('User Not found');
            return;
        }
        */
        let photoObj = JSON.parse(JSON.stringify(photos));

        photoObj.forEach(function(photo) {
            delete photo.__v;
        });

        async.each(photoObj, function (photo, photoCallback) {
            async.each(photo.comments, function (comment, commentCallback) {
                User.findOne({_id: comment.user_id}, function (err, user) {
                    if (err || !user) {
                        response.status(400).send(err);
                    }
                    let userObj = JSON.parse(JSON.stringify(user));
                    //console.log('userObj: ', userObj);
                    delete userObj.location;
                    delete userObj.description;
                    delete userObj.occupation;
                    delete userObj.__v;
                    delete comment.user_id;
                    comment['user'] = userObj;
                    commentCallback(err);
                });
            }, function (err) {
                photoCallback(err);
            });
        }, function (err) {
            if (err) {
                response.status(400).send(JSON.stringify(err));
            } else {
                response.status(200).send(JSON.stringify(photoObj));
            }
        });
    });
});

//Posting photo
app.post('/photos/new', function(request, response) {
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(400).send(JSON.stringify(err));
            return;
        }

        if (request.file.size === 0) {
            response.status(400).send('Invalid File');
            return;
        }

        const timestamp = new Date().valueOf();
        const filename = 'U' + String(timestamp) + request.file.originalname;

        fs.writeFile('./images/' + filename, request.file.buffer, function (err) {
            if (err) {
                response.status(400).send('Error creating file');
                return;
            }
        });

        Photo.create({
            file_name: filename,
            date_time: new Date(),
            user_id: request.session.user_id,
            comments: []
        }, function (err, newPhoto) {
            if (err) {
                response.status(400).send('Failed to create photo');
            }

            let record = new Record({
                file_name: filename,
                user_name: request.session.first_name + ' ' + request.session.last_name,
                activity_type: 'Photo Upload'
            });
            record.save();

            response.status(200).send(JSON.stringify(newPhoto));
        })
    });
});

//Posting comments
app.post('/commentsOfPhoto/:photo_id', function(request, response) {
    
    if (request.session.login_name === null) {
        response.status(401).send('Unauthorized');
    }
    var photo_id = request.params.photo_id;
    var user = request.session.user_id;
    var comment_text = request.body.comment;
    console.log('comment text: ' + String(comment_text));
    if (comment_text === '') {
        response.status(400).send('Comment has no text.');
        return;
    }
    
    
    Photo.findOne({ _id: photo_id}, function(err, photo) {
        if (err)  {
            response.status(400).send('Photo with id ' + photo_id + ' not found');
            return;
        }
        console.log(photo);
        let current_time = new Date();

        let comment = {
            comment: comment_text,
            date_time: current_time, //probably don't need this
            user_id: user,
        }
        console.log(comment);
        photo.comments.push(comment);
        photo.save();

        let record = new Record({
            file_name: photo.file_name,
            user_name: request.session.first_name + ' ' + request.session.last_name,
            activity_type: 'New Comment'
        });
        record.save();

        response.status(200).send(comment);
    });
});

//Creating new user
app.post('/user', function(request, response) {
    let {login_name, password, first_name, last_name, location, description, occupation} = request.body;
    if (!login_name || !password || !first_name || !last_name) {
        response.status(400).send('User must specify login name, password, first name, and last name.');
        return;
    }
    
    User.findOne({login_name: login_name}, function(err, user) {
        console.log(user);
        if (user) {
            return response.status(400).send('User with username ' + login_name + ' already registered.');
        } else {
            const newUser = new User({
                login_name: login_name,
                password: password,
                first_name: first_name,
                last_name: last_name,
                location: location,
                description: description,
                occupation: occupation
            });

            let record = new Record({
                user_name: first_name + ' ' + last_name,
                activity_type: 'User Registration',
            });
            record.save();

            newUser.save().then(() => response.status(200).send(JSON.stringify(newUser))).catch(err => response.status(400).send(JSON.stringify(err)));
        }
    })
});


//User login
app.post('/admin/login', function(request, response) {
    let username = request.body.login_name;
    User.findOne({login_name: username}, function(err, user) {
        if (err) {
            console.error('Doing /admin/login error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user === null) {
            console.log('User with login name: ' + username + ' not found.');
            response.status(400).send(username + 'is not a valid username');
            return;

        }

        let userObj = JSON.parse(JSON.stringify(user));
        console.log(userObj);

        if (request.body.password !== userObj.password) {
            response.status(400).send(JSON.stringify(err));
            return;
        }

        request.session.login_name = username;
        request.session.user_id = userObj._id;
        request.session.first_name = userObj.first_name;
        request.session.last_name = userObj.last_name;
        request.session.save();

        let { _id, first_name, last_name, login_name } = userObj;
        let newUser = { _id, first_name, last_name, login_name };

        let record = new Record({
            user_name: first_name + ' ' + last_name,
            activity_type: 'User Login',
        });
        record.save();

        response.status(200).send(newUser);
    });
});


//User logout
app.post('/admin/logout', function(request, response) {
    if (request.session.login_name === null) {
        response.status(400).send('Bad Request');
    }
    let first_name = request.session.first_name;
    let last_name = request.session.last_name;
    console.log(first_name);
    console.log(last_name);
    if (!request.body.destroy) {
        let record = new Record({
            user_name: first_name + ' ' + last_name,
            activity_type: 'User Logout',
        });
        record.save();
    }

    request.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        response.status(200).send();
    });
    //request.session.save();
    //reponse.status(400).send('');
})

//Liking/Disliking Photos
app.post('/likePhotoWithId/:id', function(request, response) {
    if (request.session.login_name === null) {
        response.status(401).send('Unauthorized');
        return;
    }

    let user_id = request.session.user_id;
    let first_name = request.session.first_name;
    let id = request.params.id;

    Photo.findOne({ _id: id}, function(err, photo) {
        if (err)  {
            return response.status(400).send('Photo with id ' + id + ' not found');
        }
        //Dislike
        for (let i = 0; i < photo.likes.length; i++) {
            if (photo.likes[i].user_first_name === request.session.first_name) {
                console.log('dislike!!');
                Photo.updateOne({_id: id}, { $pull: { likes: { user_id: request.session.user_id } } }).then(res => {
                    let record = new Record({
                        file_name: photo.file_name,
                        user_name: request.session.first_name + ' ' + request.session.last_name,
                        activity_type: 'Like Removed'
                    });
                    record.save();
                    return response.status(200).send(res);
                }).catch(err => {
                    return response.status(400).send(err);
                });
            }
        }
        if (photo.likes.filter(like => like.user_first_name === request.session.first_name).length === 0) {
            let like = {
                user_id: user_id,
                user_first_name: first_name,
            }
            photo.likes.push(like);
            photo.save();
            console.log('Successfully liked. likes: ' + JSON.stringify(photo.likes));
            let record = new Record({
                file_name: photo.file_name,
                user_name: request.session.first_name + ' ' + request.session.last_name,
                activity_type: 'New Like'
            });
            record.save();
    
            response.status(200).send();
        }
        
    });
})

//Get activity feed
app.get('/retrieve/activity', function(request, response) {
    if (request.session.login_name === null) {
        response.status(401).send('Unauthorized');
    }
    console.log('in retrieve activity');
    Record.find().sort({ _id: -1 }).limit(5).exec(function (err, records) {
        if (err)  {
            response.status(400).send('Failed to obtain activity records.');
            return;
        }
        let recordsObj = JSON.parse(JSON.stringify(records));
        //filters through to remove undefined
        /*
        for (let i = 0; i < recordsObj.length; i++) {
            if (recordsObj[i].user_name === undefined && recordsObj[i].activity_type === 'User Logout') {
                recordsObj.splice(i, 1);
            }
        }
        recordsObj.splice(0,5);
        */
        response.status(200).send(recordsObj);
    })

})

//Delete requests

//Delete photo
//params: photo_user_id (the user id of the current photo)
app.delete('/delete/photoWithId/:id', function(request, response) {
    if (request.session.login_name === null) {
        response.status(401).send('Unauthorized');
        return;
    }
    let id = request.params.id;
    let photo_user = request.body.photo_user_id;
    if (photo_user !== request.session.user_id) {
        response.status(401).send('Unauthorized. You can only delete your own photos.')
        return;
    }

    let record = new Record({
    user_name: request.session.first_name + ' ' + request.session.last_name,
    activity_type: 'Deleted Photo',
    });
    record.save();


    Photo.deleteOne({_id: id}, function(err, res) {
        if (err) {
            response.status(400).send(err);
            return;
        }
        response.status(200).send(res);
    })
})

//Delete comment
//params: comment_id, comment_user_id
app.delete('/delete/commentWithId/:id', function(request, response) {
    if (request.session.login_name === null) {
        response.status(401).send('Unauthorized');
        return;
    }
    let id = request.params.id;
    let comment_user_id = request.body.comment_user_id;
    let photo_id = request.body.photo_id;

    if (comment_user_id !== request.session.user_id) {
        response.status(401).send('Unauthorized. You can only delete your own comments.');
        return;
    }

    let record = new Record({
        user_name: request.session.first_name + ' ' + request.session.last_name,
        activity_type: 'Deleted Comment',
    });
    record.save();

    Photo.updateOne({_id: photo_id}, { $pull: { comments: { _id: id } } }).then(res => {
        response.status(200).send(res);
        return;
    }).catch(err => {
        response.status(400).send(err);
        return;
    });
})

//Delete User
//delete user object, all photos, all comments
app.delete('/delete/user/:id', function(request, response) {
    if (request.session.login_name === null) {
        return response.status(401).send('Unauthorized');
    }
    let id = request.params.id;
    if (id !== request.session.user_id) {
        return response.status(401).send('Unauthorized');
    }

    let record = new Record({
        user_name: request.session.first_name + ' ' + request.session.last_name,
        activity_type: 'Deleted User',
    });
    record.save();

    Photo.updateMany({ }, {$pull: {comments: {user_id: id}}}, {multi: true}, function (err) {
        if (err) {
            return response.status(400).send(err);
        }

        Photo.deleteMany({user_id: id}, function(err) {
            if (err) {
                return response.status(400).send(err);
            }

            User.deleteOne({_id: id}, function(err, res) {
                if (err) {
                    return response.status(400).send(err);
                }
                response.status(400).send(res);
            })
        })
    })
})


app.get('/login-check', function(request, response) {
    response.send(request.session.first_name);
})


var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


