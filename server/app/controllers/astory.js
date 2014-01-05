/**
 * Created by Delios on 11/30/13.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Story = mongoose.model('Story'),
    Schema = mongoose.Schema,
    Scenario = mongoose.model('Scenario'),
    hash = require('../../Utils/hash');

exports.list = function (req, res) {
    /*var conditions, fields, options;
     console.log('LIST:' + req.params);

     conditions = {};


     if (req.params.isSold !== undefined) {
     conditions['isSold'] = req.params.isSold;
     } else if (req.params.hasBids !== undefined) {
     conditions['$where'] = "this.bids.length > 0";
     }
     fields = {};
     sort = {'make' : 1};

     Auto
     .find(conditions, fields, options)
     .sort(sort)
     .exec(function (err, doc) {
     var retObj = {
     meta: {"action": "list", 'timestamp': new Date(), filename: __filename},
     doc: doc,
     err: err
     };
     return res.send(retObj);
     }) */
};

exports.loggedin = function (req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
};

exports.register = function (req, res) {
    hash(req.body.password, function (err, salt, hash) {
        if (err) throw err;
        req.body.passwordhash = hash;
        req.body.password = null;
        req.body.birthdate = new Date(req.body.birthdate);
        req.body.salt = salt;
        var doc = new User(req.body);
        console.log("Saving new account: " + req.body.username);
        doc.save(function (err) {
            if (err !== null) {
                console.log(err);
            }
            var retObj = {
                meta: {"action": "Register account", 'timestamp': new Date(), filename: __filename},
                err: err
            };
            return res.send(retObj);

        });

    });

};

exports.isValidUserPassword = function (username, password, done) {
    User.findOne({username: username}, function (err, user) {
        // if(err) throw err;
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Non-existing username' });
        hash(password, user.salt, function (err, hash) {
            if (err) return done(err);
            if (hash == user.passwordhash) {
                return done(null, user);
            }
            done(null, false, {
                message: 'Incorrect password'
            });
        });
    });
};

exports.listStories = function (req, res) {
    "use strict";
    var conditions, fields, sort, temp;
    console.log('LIST ' + req.user.username + "'s stories, ID: " + req.user._id);

    conditions = {creator: req.user._id};
    fields = {};
    sort = {};

    Story
        .find(conditions, fields, null)
        .sort(sort)
        .exec(function (err, doc) {
            var retObj = {
                meta: {"action": "list", 'timestamp': new Date(), filename: __filename},
                doc: doc,
                err: err
            };
            return res.send(retObj);
        });
};

exports.listScenarios = function (req, res) {
    "use strict";
    var conditions, fields, sort, temp;

    conditions = {creator: req.user._id, story: req.params.storyid};
    fields = {};
    sort = {};

    Scenario
        .find(conditions, fields, null)
        .sort(sort)
        .exec(function (err, doc) {
            var retObj = {
                meta: {"action": "list", 'timestamp': new Date(), filename: __filename},
                doc: doc,
                err: err
            };
            return res.send(retObj);
        });
}

exports.addStory = function (req, res) {
    "use strict";
    var doc = new Story(
        {
            name: req.body.name,
            creator: req.user._id,
            scenarios: []
        }
    );

    doc.save(function (err) {
        if (err !== null) {
            console.log(err);
        }
        var retObj = {
            meta: {"action": "create", 'timestamp': new Date(), filename: __filename},
            doc: doc,
            err: err
        };
        return res.send(retObj);

    });
};

exports.addScenario = function (req, res) {
    "use strict";
    var conditions, fields;

    conditions = {_id: req.params.storyid};
    fields = {};

    Story
        .findOne(conditions, fields, null)
        .exec(function (err, doc) {

            if(doc === undefined) {
                res.send("Invalid story");
                return 0;
            }

            if(doc.creator == req.user._id){
                var doc = new Scenario(
                    {
                        name: req.body.name,
                        story: req.params.storyid,
                        creator: req.user._id
                    }
                );

                doc.save(function (err) {
                    if (err !== null) {
                        console.log(err);
                    }
                    var retObj = {
                        meta: {"action": "create", 'timestamp': new Date(), filename: __filename},
                        doc: doc,
                        err: err
                    };
                    return res.send(retObj);

                });
            } else {
                res.send(401);
            }

        });
};


exports.deleteStory = function (req, res) {
    "use strict";
    var conditions;

    conditions = {creator: req.user._id, _id: req.params._id};

    Story
        .remove(conditions)
        .exec(function (err, doc) {
            var retObj = {
                meta: {"action": "remove", 'timestamp': new Date(), filename: __filename},
                doc: doc,
                err: err
            };
            deleteScenarios(req.params._id);
            return res.send(retObj);
        });
};

function deleteScenarios(storyid){
    var conditions = {story : storyid};

    Scenario
        .remove(conditions)
        .exec(function (err, doc) {
            console.log(doc);
        });
}

exports.deleteScenario = function(req, res) {
    "use strict";
    var conditions;

    conditions = {creator: req.user._id, _id: req.params.scenarioid};

    Scenario
        .remove(conditions)
        .exec(function (err, doc) {
            var retObj = {
                meta: {"action": "remove", 'timestamp': new Date(), filename: __filename},
                doc: doc,
                err: err
            };
            return res.send(retObj);
        });
}

exports.updateStory = function (req, res) {
    var conditions = {creator: req.user._id, _id: req.params._id}, update, options;

    console.log("UPDATE: " + req.body.name);
    update = {name: req.body.name};
    options = {};

    Story
        .findOneAndUpdate(conditions, {$set: update}, options)
        .exec(function (err, doc) {
            retObj = {
                meta: {"action": "update", 'timestamp': new Date(), filename: __filename},
                doc: doc,
                err: err
            };
            return res.send(retObj);
        });
}

exports.updateScenario = function (req, res) {
    var conditions = {creator: req.user._id, _id: req.params.scenarioid}, update, options;
    update = {name: req.body.name};
    options = {};

    Scenario
        .findOneAndUpdate(conditions, {$set: update}, options)
        .exec(function (err, doc) {
            retObj = {
                meta: {"action": "update", 'timestamp': new Date(), filename: __filename},
                doc: doc,
                err: err
            };
            return res.send(retObj);
        });
}

