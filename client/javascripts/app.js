"use strict";

/**
 * @see http://docs.angularjs.org/guide/concepts
 */
var aStory = angular.module('aStory', [ 'ngResource', 'ui.bootstrap']);

aStory.config(['$httpProvider', '$locationProvider', '$routeProvider', function ($httpProvider, $locationProvider, $routeProvider) {
    var checkLoggedin = function ($q, $timeout, $http, $location, loggedinService) {
        // Initialize a new promise
        var deferred = $q.defer();

        // Make an AJAX call to check if the user is logged in
        $http.get('/loggedin').success(function (user) {
            // Authenticated
            if (user !== '0') {
                loggedinService.loggedin = true;
                loggedinService.accountinfo.username = user.username;
                loggedinService.accountinfo.email = user.email;
                $timeout(deferred.resolve, 0);
            } else {
                loggedinService.loggedin = false;
                $timeout(function () {
                    deferred.reject();
                }, 0);
                $location.path('/login');
            }
        });

        return deferred.promise;
    };

    var checkNotLoggedIn = function ($q, $timeout, $http, $location, loggedinService){
        // Initialize a new promise
        var deferred = $q.defer();

        // Make an AJAX call to check if the user is logged in
        $http.get('/loggedin').success(function (user) {
            // Authenticated
            if (user !== '0') {
                loggedinService.loggedin = true;
                loggedinService.accountinfo.username = user.username;
                loggedinService.accountinfo.email = user.email;
                $timeout(function () {
                    deferred.reject();
                }, 0);
                $location.path('/stories');
            } else {
                loggedinService.loggedin = false;
                $timeout(deferred.resolve, 0);
            }
        });

        return deferred.promise;
    };

    $routeProvider
        .when('/', {
            templateUrl: 'partials/home.html',
            controller: 'homeController'
        })
        .when('/home', {
            templateUrl: 'partials/home.html',
            controller: 'homeController'
        })
        .when('/editor', {
            templateUrl: 'partials/editor.html',
            controller: 'editorController',
            resolve: { loggedin: checkLoggedin }
        })
        .when('/stories', {
            templateUrl: 'partials/storyoverview.html',
            controller: 'overviewController',
            resolve: { loggedin: checkLoggedin }
        })
        .when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'loginController',
            resolve: {notloggedin: checkNotLoggedIn}
        })
        .when('/register', {
            templateUrl: 'partials/register.html',
            controller: 'registerController',
            resolve: {notloggedin: checkNotLoggedIn}
        })
        .when('/account', {
            templateUrl: 'partials/account.html',
            controller: 'accountController',
            resolve: { loggedin: checkLoggedin }
        })
        .when('/preview', {
            templateUrl: 'partials/preview.html',
            controller: 'previewController',
            resolve: { loggedin: checkLoggedin }
        })
        .otherwise({
            redirectTo: '/'
        });

}]);