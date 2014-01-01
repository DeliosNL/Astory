var mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.userExist = function (req, res, next) {
    User.count({
        username: req.body.username
    }, function (err, count) {
        if (count > 0) {
            console.log("Failed to create account: " + req.body.username + ", Username already exists!");
            res.send({
                validationerror: "Username already exists"
            });
            return 0;
        }

        User.count({
            email: req.body.email
        }, function (err, count) {
            if (count > 0) {
                console.log("Failed to create account: " + req.body.username + ", Email: " + req.body.email + " already exists!");
                res.send({
                    validationerror: "Email already exists"
                });
                return 0;
            }
        });

        next();
    });
};
