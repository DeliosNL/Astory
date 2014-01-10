/*globals aStory */

/**
 * Factory for account operations. Mainly used to create accounts or update account information.
 */
aStory.factory('accountService', ['$resource', '$http', function ($resource) {
    "use strict";
    var actions = {
            'get': {method: 'GET'},
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'query': {method: 'GET', isArray: true},
            'delete': {method: 'DELETE'}
        },
        db = {};
    db.users = $resource('/users', {}, actions);
    return db;
}]);

/**
 * This service stores the currently selected story so it can be shared amongst different controllers.
 */
aStory.service('currentStoryService', [function () {
    "use strict";
    var currentstorylocal = null;
    return {
        currentstory: currentstorylocal
    };
}]);

/**
 * This service saves the user's account details for usage in different controllers
 */
aStory.service('loggedinService', [function () {
    "use strict";
    return {
        loggedin: false,
        accountinfo: {
            username: null,
            email: null
        }
    };
}]);

/**
 * This service allows for a logout action, this will break the login session.
 */
aStory.factory('logoutService', ['$resource', '$http', function ($resource) {
    "use strict";
    var actions = {
            'get': {method: 'GET'}
        },
        db = {};
    db.logout = $resource('/logout', {}, actions);
    return db;
}]);

/**
 * This service allows operations for creating new stories, updating stories, deleting stories and retrieving stories.
 */
aStory.factory('storiesService', ['$resource', '$http', function ($resource) {
    "use strict";
    var actions = {
            'get': {method: 'GET'},
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'delete': {method: 'DELETE'}
        },
        db = {};
    db.stories = $resource('/stories/:_id', {}, actions);
    return db;
}]);

/**
 * This service allows operations for creating scenario's and getting all of a story's scenaros.
 */
aStory.factory('scenariosService', ['$resource', '$http', function ($resource) {
    "use strict";
    var actions = {
            'get': {method: 'GET'},
            'save': {method: 'POST'}
        },
        db = {};
    db.scenarios = $resource('/scenarios/:storyid', {}, actions);
    return db;
}]);

/**
 * This service allows operations for updating a single scenario or deleting a single scenarios.
 */
aStory.factory('scenarioService', ['$resource', '$http', function ($resource) {
    "use strict";
    var actions = {
            'update': {method: 'PUT'},
            'delete': {method: 'DELETE'}
        },
        db = {};
    db.scenario = $resource('/scenario/:scenarioid', {}, actions);
    return db;
}]);

/**
 * This service allows operations for retrieving all scene's from a scenario and for adding a scene to a scenario.
 */
aStory.factory('scenesService', ['$resource', '$http', function ($resource) {
    "use strict";
    var actions = {
            'get': {method: 'GET'},
            'save': {method: 'POST'}
        },
        db = {};
    db.scenes = $resource('/scenes/:scenarioid', {}, actions);
    return db;
}]);

/**
 * This server allows operations for deleting a single scene or updating a single scene.
 */
aStory.factory('sceneService', ['$resource', '$http', function ($resource) {
    "use strict";
    var actions = {
            'update': {method: 'PUT'},
            'delete': {method: 'DELETE'}
        },
        db = {};
    db.scene = $resource('/scene/:sceneid', {}, actions);
    return db;
}]);