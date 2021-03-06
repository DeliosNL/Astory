var mongoose;
mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var sceneSchema = Schema({
    scenario: {type: String, required: true},
    creator: {type: String, required: true},
    background: {type: String, default: 'images/Assets/Achtergrond1A.png'},
    assets: {type: Array, default: []},
    date: {type: Date, default: Date.now()},
    image: {type: String, default: "sceneexample.png"}
});

var modelName = "Scene";
var collectionName = "scenes"; // Naming convention is plural.
mongoose.model(modelName, sceneSchema, collectionName);

