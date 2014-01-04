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
    app.post('/stories', Auth.isloggedIn, controller.addStory);
    app.delete('/stories/:_id', Auth.isloggedIn, controller.deleteStory);
    app.put('/stories/:_id', Auth.isloggedIn, controller.updateStory);
}
