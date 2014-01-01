/**
 * Created by Delios on 11/30/13.
 */
var Auth = require('../middlewares/authorization');
var mongoose = require('mongoose');
var User = mongoose.model('User');
module.exports = function (app) {

    var controller = require('../app/controllers/astory.js'),
    passport = require('passport');

    var auth = function(req, res, next){
        if (!req.isAuthenticated()) res.send(401);
        else next();
    };

    //PASSPORT
    app.get('/loggedin', controller.loggedin);

    //Users
    app.post("/users", Auth.userExist, controller.register);


}