var mongoose = require('mongoose')
    , LocalStrategy = require('passport-local').Strategy
    , User = mongoose.model('User'),
    controller = require('../app/controllers/astory.js');


module.exports = function (passport, config) {

    passport.serializeUser(function (user, done) {
        console.log("Serializing: " + user.id);
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findOne({ _id: id }, function (err, user) {
            console.log("Deserializing: " + user.username);
            done(err, user);
        });
    });

    passport.use(new LocalStrategy(
        function (username, password, done) {
            controller.isValidUserPassword(username, password, done);
        }
    ));
};
