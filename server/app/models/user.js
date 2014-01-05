
var mongoose;
mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = Schema({
    username: {type: String, required: true, unique: true},
    passwordhash: {type: String, required: true},
    salt: {type: String, required: true},
    email: {type: String, required: true, unique:true},
    birthdate: {type: Date,default: null, required: true}
});

var modelName = "User";
var collectionName = "users"; // Naming convention is plural.
mongoose.model(modelName, userSchema, collectionName);

