"use strict";

/**
 * @see http://docs.angularjs.org/guide/concepts
 */
var aStory = angular.module('aStory', [ 'ngResource']);

aStory.config(['$httpProvider', '$locationProvider', '$routeProvider', function ($httpProvider, $locationProvider, $routeProvider) {


    $routeProvider
        .when('/', {
            templateUrl: 'partials/editor.html',
            controller: 'editorController'
        })
        .otherwise({
            redirectTo: '/'
        });

}]);