/*jslint node: true, plusplus: true, todo: true  */
/*globals document */

"use strict";

aStory.controller('mainController', ['$scope', function ($location, $scope, $http) {
    //TODO: invullen
}]);

aStory.controller('registerController', ['$scope', function($scope){
    $scope.days = [];
    for(var i = 0; i <= 31; i++){
        $scope.days.push(i);
    }

    $scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    $scope.years = [];
    for(var i = new Date().getFullYear(); i >= 1900; i--){
        $scope.years.push(i);
    }

    $("select:has(option[value=]:first-child)").on('change', function() {
        $(this).toggleClass("empty", $.inArray($(this).val(), ['', null]) >= 0);
    }).trigger('change');
}]);

aStory.controller('loginController', ['$scope', function ($scope) {
    //TODO: invullen
}]);

aStory.controller('headerController', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        if ($location.path() === '/login' || $location.path() === '/register') {
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

aStory.controller('storypopupController', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
    $scope.close = function () {
        $modalInstance.close();
    };
}]);

aStory.controller('overviewController', ['$scope', '$modal', function($scope, $modal) {
    $scope.showCreateStoryPopup = function () {
        var modalInstance = $modal.open({
            templateUrl: '../partials/createstorypopup.html',
            controller: 'storypopupController',
            resolve: {
            }
        });
    };

    $scope.showStoryPopup = function () {
        var modalInstance = $modal.open({
            templateUrl: '../partials/storypopup.html',
            controller: 'storypopupController',
            resolve: {
            }
        });
    };
}]);

aStory.controller('editorController', ['$scope', '$modal', function ($scope, $modal) {
    $scope.showStoryPopup = function () {
        var modalInstance = $modal.open({
            templateUrl: '../partials/storypopup.html',
            controller: 'storypopupController',
            resolve: {
            }
        });
    };
    // $scope.showpopup = true;

    $scope.setEditorbarDropdownColor = function (id, currentlyvisible) {
        if (currentlyvisible) { //Will be invisible soon
            document.getElementById(id).style.backgroundColor = document.getElementById('editorbar').style.backgroundColor;
        } else { //Will become visible soon
            var editorbarbuttons = document.getElementsByClassName('editorbarbutton');
            for (var i = 0; i < editorbarbuttons.length; i++) {
                editorbarbuttons[i].style.backgroundColor = document.getElementById('editorbar').style.backgroundColor;
            }
            $scope.showscenarios = false;
            document.getElementById(id).style.backgroundColor = "#ffffff";
        }
    };

    $scope.assetgroups = [
        {
            name: "Most used assets",
            assets: [
                {
                    "name": "Kerstboom",
                    "description": "Kerstboom",
                    "image": "Boom.png"
                },
                {
                    "name": "Hond",
                    "description": "Keeshond",
                    "image": "Hond.png"
                },
                {
                    "name": "Rendier",
                    "description": "Rendier",
                    "image": "Rendier.png"
                },
                {
                    "name": "Sneeuwpop",
                    "description": "Sneeuwpop",
                    "image": "Sneeuwpop.png"
                },
                {
                    "name": "Achtergrond1A",
                    "description": "Sneeuwbergen achtergrond",
                    "image": "Achtergrond1A.png"
                },
                {
                    "name": "Spaceshuttle",
                    "description": "Spaceshuttle",
                    "image": "Spaceshuttle.png"
                }
            ]
        },
        {
            name: "Characters",
            assets: [
                {
                    "name": "Hond",
                    "description": "Keeshond",
                    "image": "Hond.png"
                },
                {
                    "name": "Rendier",
                    "description": "Rendier",
                    "image": "Rendier.png"
                },
                {
                    "name": "Sneeuwpop",
                    "description": "Sneeuwpop",
                    "image": "Sneeuwpop.png"
                }
            ]
        },
        {
            name: "Huizen",
            assets: [
                {
                    "name": "Wit huisje",
                    "description": "Wit huisje",
                    "image": "Huis1.png"
                },
                {
                    "name": "Wit huisje 2",
                    "description": "Wit huisje v2",
                    "image": "Huis2.png"
                },
                {
                    "name": "Bruin huisje",
                    "description": "Bruin huisje",
                    "image": "Huis3.png"
                },
                {
                    "name": "Bruin huisje 2",
                    "description": "Bruin huisje v2",
                    "image": "Huis4.png"
                },
                {
                    "name": "Mooi huis",
                    "description": "Mooi huisje",
                    "image": "6_huis.png"
                }
            ]
        }
    ];

    $scope.scenes = [
        {
            "image": "sceneexample.png"
        },
        {
            "image": "sceneexample.png"
        },
        {
            "image": "sceneexample.png"
        },
        {
            "image": "sceneexample.png"
        },
        {
            "image": "sceneexample.png"
        },
        {
            "image": "sceneexample.png"
        },
        {
            "image": "sceneexample.png"
        },
        {
            "image": "sceneexample.png"
        },
        {
            "image": "sceneexample.png"
        },
        {
            "image": "sceneexample.png"
        },
        {
            "image": "sceneexample.png"
        }
    ]
}]);