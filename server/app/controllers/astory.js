/**
 * Created by Delios on 11/30/13.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Story = mongoose.model('Story'),
    Scenario = mongoose.model('Scenario'),
    Scene = mongoose.model('Scene'),
    Schema = mongoose.Schema,
    hash = require('../../Utils/hash');

/**
 * Function for checking whether the user is logged in (Serialize or not). Sends the user's information
 * if this is true, otherwise sends '0'.
 * @param req Request object, used to identify the user making the request.
 * @param res Response object used to send the response
 */
exports.loggedin = function (req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
};

/**
 * Creates a new user in the database. The user's password is encrypted with it's own salt.
 * @param req Request object, use to retrieve the new document's info.
 * @param res Response object used to send the response
 */
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

/**
 * Authentication function called when a user tries to login.
 * Makes a hash of the received password and compares it with the user's hashed password.
 * @param username Username of the user trying to log in.
 * @param password Password to be hashed and checked.
 * @param done
 */
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

/**
 * List all a user's stories. The serialized user's _id is the condition for finding the stories.
 * @param req Request object, used for retrieving the serialized user's _id
 * @param res Response object used to send the response
 */
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

/**
 * Lists all a story's scenarios, found on basis of a story's _id. The user making the request does not have to be
 * the scenarios' owner. The scenarios can be retrieved for viewing rather than editing.
 * @param req Request object, used to retrieve the story-id to retrieve scenario's from.
 * @param res Response object used to send the response
 */
exports.listScenarios = function (req, res) {
    "use strict";
    var conditions, fields, sort, temp;

    conditions = {story: req.params.storyid};
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
};

/**
 * Lists all a scenario's scenes, found on basis of a scenario's _id. The user making the request does not have to be
 * the scenes' owner. The scenes can be retrieved for viewing rather than editing.
 * @param req Request object, used to retrieve the scenarioid for the query's conditions
 * @param res Response object used to send the response
 */
exports.listScenes = function (req, res) {
    "use strict";
    var conditions, fields, sort, temp;

    conditions = {scenario: req.params.scenarioid};
    fields = {};
    sort = {date: 1};

    Scene
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

/**
 * Adds a story to the database, the creator of the story will be the user who sent the request.
 * @param req Request object used for retrieving the user's _id
 * @param res Response object used to send the response
 */
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

/**
 * Adds a scenario to a specified story, story is found on basis of it's _id property.
 * The user sending the request needs to the creator of the story in order for the query to work.
 * @param req Request object containing the storyid, the user's id  and the new scenario's name for the query's conditions.
 * @param res Response object used to send the response
 */
exports.addScenario = function (req, res) {
    "use strict";
    var conditions, fields;

    conditions = {_id: req.params.storyid};
    fields = {};

    Story
        .findOne(conditions, fields, null)
        .exec(function (err, doc) {

            if(doc === undefined || doc === null) {
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

                //De lijst met scenariovolgorde moet een nieuwe entry @ story
                Story
                    .findOneAndUpdate(conditions, {$push: {scenarioorder: doc._id.toString()}})
                    .exec(function (err, doc) {
                        console.log("Added scenario to scenarioorder: " + doc);
                    });

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

/**
 * Adds a scene to the specfied scenario. Scenario to add the scene to is determined by the given _id of the scenario.
 * The user needs to be the creator of the scenario in order for the request to work.
 * @param req Request object containing info about the user making the request and the _id of the scenario to add a scene to.
 * @param res Response object used to send the response
 */
exports.addScene = function (req, res){
    "use strict";
    var conditions, fields;

    conditions = {_id: req.params.scenarioid};
    fields = {};

    Scenario
        .findOne(conditions, fields, null)
        .exec(function (err, doc) {

            if(doc === undefined || doc === null) {
                res.send("Invalid scenario");
                return 0;
            }

            if(doc.creator == req.user._id){
                var doc = new Scene(
                    {
                        scenario: req.params.scenarioid,
                        creator: req.user._id
                    }
                );
            //Update de sceneorder lijst @ Scenario-parent
                Scenario
                    .findOneAndUpdate(conditions, {$push: {sceneorder: doc._id.toString()}})
                    .exec(function(scenarioerr, scenariodoc) {
                        if(scenariodoc !== null){
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
                            res.send("Failed updating sceneorder list");
                        }
                    })

            } else {
                res.send(401);
            }

        });
};

/**
 * Deletes a story and all related scenario's and scenes. The user making the request needs to be the creator
 * of the story in order for the request to work.
 * @param req Request object containing the _id of the story to delete and the user's _id.
 * @param res Response object used to send the response
 */
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

/**
 * Deletes all the scenario's from a specified story
 * @param storyid _id property of the story
 */
function deleteScenarios(storyid){
    var conditions = {story : storyid};

    Scenario
        .find(conditions)
        .exec(function (err, doc) {
            console.log(doc);
            for(var i = 0; i < doc.length; i++){
                deleteScenes(doc[i]._id);
            }
            Scenario
                .remove(conditions)
                .exec(function (err, doc) {
                    console.log("Deleted scenarios from story: " + storyid);
                });
        });
}

/**
 * Deletes all of a scenario's scenes.
 * @param scenarioid _id of the scenario.
 */
function deleteScenes(scenarioid) {
    var conditions = {scenario : scenarioid};
    Scene
        .remove(conditions)
        .exec(function (err, doc) {
           console.log("Deleted scenes from scenario: " + scenarioid);
        });
}

/**
 * Delete's a single scenario and all related scenes.
 * The scenario to delete is found on basis of _id, the user making the request needs to be the scenario's owner in
 * order for the request to work.
 * @param req Request object containing the user's _id and the scenario's _id.
 * @param res Response object used to send the response
 */
exports.deleteScenario = function(req, res) {
    "use strict";
    var conditions, storyconditions;

    conditions = {creator: req.user._id, _id: req.params.scenarioid};

    //Scenario uit scenariovolgorde van story halen
    Scenario
        .findOne(conditions)
        .exec(function(err, doc) {

            if(doc !== null) {
                storyconditions = {creator: req.user._id, _id: doc.story};
                Story
                    .findOneAndUpdate(storyconditions, {$pull: {scenarioorder: doc._id.toString()}}, {})
                    .exec(function(err, doc) {
                        if(doc !== undefined && doc !== null) {
                            //Daadwerkelijk het scenario verwijderen, werd ook eens tijd
                            Scenario
                                .remove(conditions)
                                .exec(function (err, doc) {
                                    deleteScenes(req.params.scenarioid);
                                    var retObj = {
                                        meta: {"action": "remove", 'timestamp': new Date(), filename: __filename},
                                        doc: doc,
                                        err: err
                                    };
                                    return res.send(retObj);
                                });

                        } else {
                            res.send(401);
                        }

                    })
            } else {
                res.send("Invalid scenario");
            }

        });

};

/**
 * Deletes a single scene. The scene to be deleted is found on basis of it's _id, the user making the request needs
 * to be the scene's owner in order to delete it.
 * @param req Request object containing the user's _id and the scene's _id.
 * @param res Response object used to send the response
 */
exports.deleteScene = function(req, res) {
    "use strict";
    var conditions;

    conditions = {creator: req.user._id, _id: req.params.sceneid};

    Scene
        .findOne(conditions)
        .exec(function (err, doc) {

            if(doc !== null){
                var scenarioconditions = {_id: doc.scenario};
                Scenario
                    .findOneAndUpdate(scenarioconditions, {$pull: {sceneorder: doc._id.toString()}})
                    .exec(function(err, doc) {
                        if(doc !== null) {
                            //Eindelijk daadwerkelijk de scene deleten
                            Scene
                                .remove(conditions)
                                .exec(function (err, doc) {
                                    var retObj = {
                                        meta: {"action": "remove", 'timestamp': new Date(), filename: __filename},
                                        doc: doc,
                                        err: err
                                    };
                                    return res.send(retObj);
                                });
                        } else {
                            res.send("Cannot find parent scenario");
                        }
                    });

            } else {
                res.send("Cannot find specified scene");
            }

        });


};

/**
 * Updates a story. Possible fields to update are the name and the order of the scenario's.
 * The user needs to be the creator of the story in order for the request to work.
 * @param req Request object containing the user's _id, the story's _id and the new data.
 * @param res Response object used to send the response
 */
exports.updateStory = function (req, res) {
    "use strict";
    var conditions = {creator: req.user._id, _id: req.params._id}, update, options, retObj;

    console.log("UPDATE: " + req.body.name);
    update = {};

    if(req.body.name !== undefined && req.body.name !== null) {
        update.name = req.body.name;
    }
    if(req.body.scenarioorder !== undefined && req.body.scenarioorder !== null) {
        update.scenarioorder = req.body.scenarioorder;
    }

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
};

/**
 * Updates a single scenario, the scenario to be updated is found on basis of it's _id. Possible fields to update are
 * the name and the order of the scenes within the scenario. The user needs to be the scenario's creator in order for
 * the request to work.
 * @param req Request object containing the user's _id, the scenario's _id and the new data.
 * @param res Response object used to send the response
 */
exports.updateScenario = function (req, res) {
    "use strict";
    var conditions = {creator: req.user._id, _id: req.params.scenarioid}, update, options, retObj;
    update = {};
    options = {};

    if(req.body.name !== undefined && req.body.name !== null){
        update.name = req.body.name
    }
    if(req.body.sceneorder !== undefined && req.body.sceneorder !== null){
        update.sceneorder = req.body.sceneorder;
    }

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
};

/**
 * Updates a single scene, the scene to be updated is found on basis of it's _id. Possible fields to update are the
 * array of assets and the scene's background-url. The user making the request needs to be the scene's owner in order
 * for the request to work.
 * @param req Request object containing the user's _id, the scene's _id and the new data.
 * @param res Response object used to send the response
 */
exports.updateScene = function (req, res){
    "use strict";
    var conditions = {creator: req.user._id, _id: req.params.sceneid}, update, options, retObj;
    update = {};

    if(req.body.assets !== undefined && req.body.assets !== null){
        update.assets = req.body.assets;
    }

    if(req.body.background !== undefined && req.body.background !== null){
        update.background = req.body.background;
    }

    options = {};
    console.log("Updating scene: " + req.params.sceneid);
    console.log(update);
    Scene
        .findOneAndUpdate(conditions, {$set: update}, options)
        .exec(function (err, doc) {
            retObj = {
                meta: {"action": "update", 'timestamp': new Date(), filename: __filename},
                doc: doc,
                err: err
            };
            return res.send(retObj);
        });
};

/**
 * Return a single story, the user making the request does NOT need to be the owner of the story in order to make this
 * request. (Used for viewing a story rather than editing it.).
 * @param req Request object containing the story's _id for the query's conditions.
 * @param res Response object used to send the response
 */
exports.detailStory = function(req, res) {
    "use strict";
    var conditions = {_id: req.params._id}, retObj;

    Story
        .findOne(conditions)
        .exec(function(err, doc) {
            retObj = {
                meta: {"action": "detail", 'timestamp': new Date(), filename: __filename},
                doc: doc,
                err: err
            };
            return res.send(retObj);
        })
};

/**
 * Returns a single scenario, the user does not need to be the owner of the scenario in order for this request to work.
 * @param req Request object containing the scenario's _id for the query's conditions.
 * @param res Response object used to send the response
 */
exports.detailScenario = function (req, res) {
    "use strict";
    var conditions = {_id: req.params.scenarioid}, retObj;

    Scenario
        .findOne(conditions)
        .exec(function(err, doc) {
            retObj = {
                meta: {"action": "detail", 'timestamp': new Date(), filename: __filename},
                doc: doc,
                err: err
            };
            return res.send(retObj);
        })
};

/**
 * Lists a single scene, the user does not need to be the owner of the scene in order for this request to work.
 * @param req Request object containing the scene's _id for the query's conditions.
 * @param res Response object used to send the response
 */
exports.detailScene = function (req, res) {
    "use strict";
    var conditions = {_id: req.params.sceneid}, retObj;

    Scene
        .findOne(conditions)
        .exec(function(err, doc) {
            retObj = {
                meta: {"action": "detail", 'timestamp': new Date(), filename: __filename},
                doc: doc,
                err: err
            };
            return res.send(retObj);
        })
};

