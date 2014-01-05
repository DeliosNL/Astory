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

aStory.service('currentStoryService', [function () {
    "use strict";
    var currentstorylocal = null;
    return {
        currentstory: currentstorylocal
    };
}]);

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

aStory.factory('logoutService', ['$resource', '$http', function ($resource) {
    "use strict";
    var actions = {
            'get': {method: 'GET'}
        },
        db = {};
    db.logout = $resource('/logout', {}, actions);
    return db;
}]);

aStory.factory('storiesService', ['$resource', '$http', function($resource) {
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

aStory.factory('scenariosService', ['$resource', '$http', function($resource) {
    "use strict";
    var actions = {
            'get': {method: 'GET'},
            'save': {method: 'POST'}
        },
        db = {};
    db.scenarios = $resource('/scenarios/:storyid', {}, actions);
    return db;
}]);

aStory.factory('scenarioService', ['$resource', '$http', function($resource) {
    "use strict";
    var actions = {
            'update': {method: 'PUT'},
            'delete': {method: 'DELETE'}
        },
        db = {};
    db.scenario = $resource('/scenario/:scenarioid', {}, actions);
    return db;
}]);