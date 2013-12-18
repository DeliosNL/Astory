"use strict";


angular.module('myApp.services', ['ngResource'])
    .factory('storyService', ['$resource', '$http', function ($resource) {
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
    var storieslocal = [
        {
            "image": "sceneexample.png",
            "name": "The Journey ofzo",
            "date": new Date().toDateString()
        }
    ];

    var currentstorylocal = null;

    return {
        stories: storieslocal,
        currentstory: currentstorylocal
    };
}]);