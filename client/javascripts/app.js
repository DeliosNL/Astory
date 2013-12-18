"use strict";

/**
 * @see http://docs.angularjs.org/guide/concepts
 */
var aStory = angular.module('aStory', [ 'ngResource', 'ui.bootstrap']);

aStory.config(['$httpProvider', '$locationProvider', '$routeProvider', function ($httpProvider, $locationProvider, $routeProvider) {


    $routeProvider
        .when('/', {
            templateUrl: 'partials/editor.html',
            controller: 'editorController'
        })
        .when('/editor', {
            templateUrl: 'partials/editor.html',
            controller: 'editorController'
        })
        .when('/stories', {
            templateUrl: 'partials/storyoverview.html',
            controller: 'overviewController'
        })
        .when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'loginController'
        })
        .when('/register', {
            templateUrl: 'partials/register.html',
            controller: 'registerController'
        })
        .when('/account', {
            templateUrl: 'partials/account.html',
            controller: 'accountController'
        })
        .when('/preview', {
            templateUrl: 'partials/preview.html',
            controller: 'previewController'
        })
        .otherwise({
            redirectTo: '/'
        });

}]);