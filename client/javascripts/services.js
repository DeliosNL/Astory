
angular.module('aStory.services', ['ngResource'])
    .factory('accountService', ['$resource', '$http', function ($resource) {
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

aStory.service('storiesService', [function() {
    "use strict";
    var storieslocal = [
        {
            "image": "sceneexample.png",
            "name": "The Journey ofzo",
            "date": new Date().toDateString()
        }
    ],
        currentstorylocal = null;

    return {
        stories: storieslocal,
        currentstory: currentstorylocal
    };
}]);

aStory.service('loggedinService', [function ($rootScope) {
    "use strict";
    return {
        loggedin: false,
        accountinfo: {
            username: null,
            name: null,
            email: null
        }
    };
}]);