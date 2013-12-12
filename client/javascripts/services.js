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
    }])

aStory.service('$fileUpload', ['$http', function($http) {

}]);