/*jslint node: true, plusplus: true, todo: true  */
/*globals document */

"use strict";

aStory.controller('mainController', ['$scope', function ($location, $scope, $http) {
    //TODO: invullen
}]);

aStory.controller('registerController', ['$scope', function ($scope) {
    $scope.days = [];
    for (var i = 0; i <= 31; i++) {
        $scope.days.push(i);
    }

    $scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    $scope.years = [];
    for (var i = new Date().getFullYear(); i >= 1900; i--) {
        $scope.years.push(i);
    }

    $("select:has(option[value=]:first-child)").on('change',function () {
        $(this).toggleClass("empty", $.inArray($(this).val(), ['', null]) >= 0);
    }).trigger('change');
}]);

aStory.controller('loginController', ['$scope', function ($scope) {
    //TODO: invullen
}]);

aStory.controller('headerController', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        if ($location.path() === '/login' || $location.path() === '/register' || $location.path() === '/preview') {
            $scope.loginpage = true;
        } else {
            $scope.loginpage = false;
        }
    });

    $scope.swapvisibility = function (visible) {
        if (visible) {
            return false;
        }
        return true;
    };

    $scope.setAccountDropdownColor = function (currentlyvisible) {
        if (currentlyvisible) {
            document.getElementById('navaccount').style.backgroundColor = "#FFFFFF";
            document.getElementById('navstorybutton').style.backgroundColor = "#dedede";
            document.getElementById('Accountname').style.color = "#545454";
            document.getElementById('navdropdownbutton').style.backgroundColor = "#9f9f9f";
        } else {
            document.getElementById('navaccount').style.backgroundColor = document.getElementById('navbar').style.backgroundColor;
            document.getElementById('navstorybutton').style.backgroundColor = "#343434";
            document.getElementById('Accountname').style.color = "#e4e4e4";
            document.getElementById('navdropdownbutton').style.backgroundColor = "#3f3f3f";
        }
    }
}]);


aStory.controller('createstorypopupController', ['$scope', '$modalInstance', 'stories', function ($scope, $modalInstance, stories) {
    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.addStory = function(name){
        stories.push({
            "image": "sceneexample.png",
            "name": name,
            "date": new Date().toDateString()
        });
        $modalInstance.close();
    };

}]);

aStory.controller('storypopupController', ['$scope', '$modalInstance', 'story', function ($scope, $modalInstance, story) {
    $scope.storyname = story.name;

    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.saveStory = function(storyname){
        story.name = storyname;
        $modalInstance.close();
    };

}]);

aStory.controller('overviewController', ['$scope', '$modal', function($scope, $modal) {
    $scope.stories = [
        {
            "image": "sceneexample.png",
            "name": "The Journey ofzo",
            "date": new Date().toDateString()
        }
    ]

    $scope.showCreateStoryPopup = function () {
        var modalInstance = $modal.open({
            templateUrl: '../partials/createstorypopup.html',
            controller: 'createstorypopupController',
            resolve: {
                stories: function () {
                    return $scope.stories;
                }
            }
        });
    };

    $scope.showStoryPopup = function (index) {
        var story = $scope.stories[index];
        var modalInstance = $modal.open({
            templateUrl: '../partials/storypopup.html',
            controller: 'storypopupController',
            resolve: {
                story: function () {
                    return story;
                }
            }
        });
    };

}]);

aStory.controller('scenariopopupController', ['$scope', '$modalInstance', 'scenarios', function($scope, $modalInstance, scenarios) {
    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.addScenario = function (name) {
        scenarios.push({
            title: name,
            linkfrom: [],
            linkto: [],
            scenes: []
        });
        $modalInstance.close();
    };

}]);
