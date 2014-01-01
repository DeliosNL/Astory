/**
 * Created by Delios on 11/30/13.
 */
var mongoose;
mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    hash = require('../../Utils/hash');

var userSchema = Schema({
    username: {type: String, required: true, unique: true},
    passwordhash: {type: String, required: true},
    email: {type: String, required: true, unique:true},
    birthdate: {type: Date,default: null, required: true}
});

userSchema.statics.signup = function(username, email, password, done){
    var User = this;
    hash(password, function(err, salt, hash){
        if(err) throw err;
        // if (err) return done(err);
        User.create({
            username: username,
            email : email,
            salt : salt,
            passwordhash : hash
        }, function(err, user){
            if(err) throw err;
            // if (err) return done(err);
            done(null, user);
        });
    });
}


var modelName = "User";
var collectionName = "users"; // Naming convention is plural.
mongoose.model(modelName, userSchema, collectionName);



/* Custom server side validators
 * @see http://mongoosejs.com/docs/api.html#document_Document-validate
 * @see http://mongoosejs.com/docs/api.html#schematype_SchemaType-validate
 * @see http://mongoosejs.com/docs/2.7.x/docs/validation.html
 *
 * if validation fails, then return false || if validation succeeds, then return true
 *
 **/
/**
 * TODO: Create custom validator
 */
/*
schemaName.path('title').validate(function(val){
    return(val !== undefined && val.length >= 8);
}, 'Invalid title');
*/
