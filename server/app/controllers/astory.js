/**
 * Created by Delios on 11/30/13.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User');
    Schema = mongoose.Schema,
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

exports.loggedin = function(req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
};

exports.register = function(req, res) {
    hash(req.body.password, function(err, salt, hash){
        if(err) throw err;
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

exports.isValidUserPassword = function(username, password, done) {
    User.findOne({username : username}, function(err, user){
        // if(err) throw err;
        if(err) return done(err);
        if(!user) return done(null, false, { message : 'Non-existing username' });
        hash(password, user.salt, function(err, hash){
            if(err) return done(err);
            if(hash == user.passwordhash){
                return done(null, user);
            }
            done(null, false, {
                message : 'Incorrect password'
            });
        });
    });
};
