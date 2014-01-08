/**
 * Created by Delios on 11/30/13.
 */
var Auth = require('../middlewares/authorization');
var mongoose = require('mongoose');
var User = mongoose.model('User');
module.exports = function (app) {

    var controller = require('../app/controllers/astory.js'),
    passport = require('passport');
/*
    var auth = function(req, res, next){
        if (!req.isAuthenticated()) res.send(401);
        else next();
    };
    */

    //PASSPORT
    app.get('/loggedin', controller.loggedin);

    //Users
    app.post("/users", Auth.userExist, controller.register);
    app.post('/login', passport.authenticate('local'), function (req, res) {
        res.send(req.user);
    });
    app.get('/logout', function(req, res){
        req.logout();
        res.send("Logout successfull");
    });

    //Stories maken/ophalen/verwijderen/bijwerken
    app.get('/stories', Auth.isloggedIn, controller.listStories);
    app.get('/stories/:_id', Auth.isloggedIn, controller.detailStory);
    app.post('/stories', Auth.isloggedIn, controller.addStory);
    app.delete('/stories/:_id', Auth.isloggedIn, controller.deleteStory);
    app.put('/stories/:_id', Auth.isloggedIn, controller.updateStory);

    //Scenarios maken/ophalen/verwijderen/bijwerken
    app.get('/scenarios/:storyid', Auth.isloggedIn, controller.listScenarios);
    app.post('/scenarios/:storyid', Auth.isloggedIn, controller.addScenario);
    app.get('/scenario/:scenarioid', Auth.isloggedIn, controller.detailScenario);
    app.delete('/scenario/:scenarioid', Auth.isloggedIn, controller.deleteScenario);
    app.put('/scenario/:scenarioid', Auth.isloggedIn, controller.updateScenario);

    //Scenes ophalen/maken/verwijderen/bijwerken
    app.get('/scenes/:scenarioid', Auth.isloggedIn, controller.listScenes);
    app.post('/scenes/:scenarioid', Auth.isloggedIn, controller.addScene);
    app.get('/scene/:sceneid', Auth.isloggedIn, controller.detailScene);
    app.delete('/scene/:sceneid', Auth.isloggedIn, controller.deleteScene);
    app.put('/scene/:sceneid', Auth.isloggedIn, controller.updateScene);
}
