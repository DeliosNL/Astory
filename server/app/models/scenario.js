var mongoose;
mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var scenarioSchema = Schema({
    name: {type: String, required: true},
    story: {type: String, required: true},
    sceneorder: {type: Array, default: []},
    creator: {type: String, required: true},
    linkto: {type: Array, default: []},
    linkfrom: {type: Array, default: []}
});

var modelName = "Scenario";
var collectionName = "scenarios"; // Naming convention is plural.
mongoose.model(modelName, scenarioSchema, collectionName);

