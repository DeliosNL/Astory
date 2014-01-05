/**
 * Created by Delios on 11/30/13.
 */
var mongoose;
mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var storySchema = Schema({
    name: {type: String, required: true},
    scenarios: [{type: Array, default: []}],
    creator: {type: String, required: true},
    date: {type: String, default: new Date().toDateString(), required: true},
    image : {type: String, required: true, default: "sceneexample.png"}

});

var modelName = "Story";
var collectionName = "stories"; // Naming convention is plural.
mongoose.model(modelName, storySchema, collectionName);

