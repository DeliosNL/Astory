/*jslint node: true, plusplus: true, todo: true  */
/*globals document */

"use strict";

aStory.controller('previewController', ['$scope', function ($scope) {
}]);

aStory.controller('mainController', ['$scope', function ($location, $scope, $http) {
    //TODO: invullen
}]);

aStory.controller('registerController', ['$scope', 'accountService', '$location', function ($scope, accountService, $location) {
    $scope.days = [];
    $scope.username = "";
    $scope.password = "";
    $scope.email = "";
    $scope.birthdateinvalid = true;
    $scope.birthdateday = "";
    $scope.birthdatemonth = "";
    $scope.birthdateyear = "";
    $scope.usedemail = false;
    $scope.usedusername = false;


    $scope.checkBirthdateValidity = function() {
        if( document.getElementById('birthdatedayinput').value !== '' &&
            document.getElementById('birthdatemonthinput').value !== '' &&
            document.getElementById('birthdateyearinput').value !== '') {
            $scope.birthdateinvalid = false;
        }
    }

    for (var i = 1; i <= 31; i++) {
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

    $scope.register = function() {
        $scope.usedusername = false;
        $scope.usedemail = false;
        var datestring = "" + $scope.months[$scope.birthdatemonth - 1] + " " + $scope.birthdateday + ", " + $scope.birthdateyear;
        var newaccount = {
            username: $scope.username,
            password: $scope.password,
            email: $scope.email,
            birthdate: datestring
        };
        accountService.users.save(newaccount, function(data) {
            if(data.validationerror !== undefined){
                if(data.validationerror === "Email already exists"){
                    $scope.usedemail = true;
                } else if (data.validationerror === "Username already exists"){
                    $scope.usedusername = true;
                } else {
                    alert("Unknown validation error: " + data.validationerror);
                }
                return 0;
            }
            if(data.err) {
                alert("Error while creating account, please retry");
                return 0;
            }
            $location.path('/login');
        });
    }
}]);

aStory.controller('loginController', ['$scope', 'loggedinService', '$location', '$http',  function ($scope, loggedinService, $location, $http) {
    $scope.failedloginattempt = false;
    $scope.login = function (usr, pwd) {
        $http.post('/login', {"username": usr, "password": pwd})
            .success(function(data, status, headers, config) {
                $scope.failedloginattempt = false;
                loggedinService.loggedin = true;
                $location.path('/stories');
            })
            .error(function(data, status, headers, config) {
                if(status === 401) {
                    $scope.failedloginattempt = true;
                } else {
                    alert("Error: " + data);
                }
            });
    }
}]);

aStory.controller('headerController', ['$scope', '$rootScope', '$location', 'loggedinService', function ($scope, $rootScope, $location, loggedinService) {
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        if ($location.path() === '/login' || $location.path() === '/register' || $location.path() === '/preview') {
            $scope.loginpage = true;
        } else {
            $scope.loginpage = false;
        }
    });

    $scope.accountinfo = loggedinService.accountinfo;
    $scope.loggedin = loggedinService.loggedin;

    $scope.$watch(
        function () {
            return loggedinService.loggedin
        },

        function (newVal) {
            $scope.loggedin = newVal;
        }
    );

    $scope.$watch(
        function () {
            return loggedinService.accountinfo
        },

        function (newVal) {
            $scope.accountinfo = newVal;
        }
        , true);

    $scope.logout = function () {
        loggedinService.loggedin = false;
        for (var i in loggedinService.accountinfo) {
            loggedinService.accountinfo[i] = null;
        }
        $location.path('/login');
    };

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


aStory.controller('createstorypopupController', ['$scope', '$modalInstance', 'storiesService', function ($scope, $modalInstance, storiesService) {
    var stories = storiesService.stories;

    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.addStory = function (name) {
        stories.push({
            "image": "sceneexample.png",
            "name": name,
            "date": new Date().toDateString()
        });
        $modalInstance.close();
    };

}]);

aStory.controller('storypopupController', ['$scope', '$modal', '$modalInstance', 'storiesService', '$location', function ($scope, $modal, $modalInstance, storiesService, $location) {
    var story = storiesService.currentstory;
    var stories = storiesService.stories;
    $scope.storyname = story.name;

    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.saveStory = function (storyname) {
        story.name = storyname;
        $modalInstance.close();
    };

    $scope.deleteStory = function () {
        var modalInstance = $modal.open({
            templateUrl: '../partials/confirmdeletepopup.html',
            controller: 'confirmdeletepopupcontroller',
            resolve: {
                itemlist: function () {
                    return stories;
                },
                itemtype: function () {
                    return "story";
                },
                item: function () {
                    return story;
                },
                popupabove: function () {
                    return $modalInstance;
                },
                name: function () {
                    return story.name;
                }
            }
        });
    }

}]);

aStory.controller('overviewController', ['$scope', '$modal', 'storiesService', '$location', '$rootScope', function ($scope, $modal, storiesService, $location) {
    $scope.stories = storiesService.stories;

    $scope.showCreateStoryPopup = function () {
        var modalInstance = $modal.open({
            templateUrl: '../partials/createstorypopup.html',
            controller: 'createstorypopupController',
            resolve: {
            }
        });
    };

    $scope.showStoryPopup = function (index) {
        storiesService.currentstory = $scope.stories[index];
        var modalInstance = $modal.open({
            templateUrl: '../partials/storypopup.html',
            controller: 'storypopupController',
            resolve: {
            }
        });
    };

    $scope.openStory = function (index) {
        storiesService.currentstory = storiesService.stories[index];
        $location.path('/editor');
    }
}]);

aStory.controller('scenariopopupController', ['$scope', '$modalInstance', 'scenarios', function ($scope, $modalInstance, scenarios) {
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

aStory.controller('confirmdeletepopupcontroller', ['$scope', '$modalInstance', '$location', 'itemlist', 'item', 'itemtype', 'popupabove', 'name', function ($scope, $modalInstance, $location, itemlist, item, itemtype, popupabove, name) {
    $scope.name = name;

    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.deleteItem = function () {
        itemlist.splice(itemlist.indexOf(item), 1);
        $scope.close();

        if(itemtype == "story") {
            $location.path('/stories');
            popupabove.close();
        }
    };

}]);