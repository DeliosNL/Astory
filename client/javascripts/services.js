
angular.module('myApp.services', ['ngResource'])
    .factory('storyService', ['$resource', '$http', function ($resource) {
        "use strict";

        var actions = {
                'get': {method: 'GET'},
                'save': {method: 'POST'},
                'update': {method: 'PUT'},
                'query': {method: 'GET', isArray: true},
                'delete': {method: 'DELETE'}
            },
            db = {};
        db.cars = $resource('/stories/:_id', {}, actions);
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