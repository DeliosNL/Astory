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

aStory.service('storiesService', [function () {
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

aStory.service('logoutService', ['$resource', '$http', function ($resource) {
    "use strict";
    var actions = {
            'get': {method: 'GET'},
        },
        db = {};
    db.logout = $resource('/logout', {}, actions);
    return db;
}]);