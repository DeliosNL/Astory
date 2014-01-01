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

};

exports.register = function(req, res) {
    console.log(req.body.password);
    hash(req.body.password, function(err, salt, hash){
        if(err) throw err;
        req.body.passwordhash = hash;
        req.body.password = null;

        var doc = new User(req.body);

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

