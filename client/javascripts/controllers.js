/*jslint node: true, plusplus: true, todo: true  */
/*globals document, aStory, $, window */

"use strict";

aStory.controller('registerController', ['$scope', 'accountService', '$location', function ($scope, accountService, $location) {
    var i,
        j;
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

    /**
     * Checks if the filled in birthday is valid.
     */
    $scope.checkBirthdateValidity = function () {
        if (document.getElementById('birthdatedayinput').value !== '' &&
                document.getElementById('birthdatemonthinput').value !== '' &&
                document.getElementById('birthdateyearinput').value !== '') {
            $scope.birthdateinvalid = false;
        }
    };

    for (i = 1; i <= 31; i++) {
        $scope.days.push(i);
    }

    $scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    $scope.years = [];
    for (j = new Date().getFullYear(); j >= 1900; j--) {
        $scope.years.push(j);
    }

    $("select:has(option[value=]:first-child)").on('change', function () {
        $(this).toggleClass("empty", $.inArray($(this).val(), ['', null]) >= 0);
    }).trigger('change');

    /**
     * Sets the new account's properties and handles validation errors.
     */
    $scope.register = function () {
        $scope.usedusername = false;
        $scope.usedemail = false;
        var datestring = $scope.months[$scope.birthdatemonth - 1] + " " + $scope.birthdateday + ", " + $scope.birthdateyear,
            newaccount = {
                username: $scope.username,
                password: $scope.password,
                email: $scope.email,
                birthdate: datestring
            };
        accountService.users.save(newaccount, function (data) {
            if (data.validationerror !== undefined) {
                if (data.validationerror === "Email already exists") {
                    $scope.usedemail = true;
                } else if (data.validationerror === "Username already exists") {
                    $scope.usedusername = true;
                } else {
                    window.alert("Unknown validation error: " + data.validationerror);
                }
                return 0;
            }
            if (data.err) {
                window.alert("Error while creating account, please retry");
                return 0;
            }
            $location.path('/login');
        });
    };
}]);


aStory.controller('loginController', ['$scope', 'loggedinService', '$location', '$http', function ($scope, loggedinService, $location, $http) {
    $scope.failedloginattempt = false;

    /**
     * Checks the entered values and validates them with the server, handling the result.
     * @param usr   Username
     * @param pwd   Password
     */
    $scope.login = function (usr, pwd) {
        $http.post('/login', {"username": usr, "password": pwd})
            .success(function () {
                $scope.failedloginattempt = false;
                loggedinService.loggedin = true;
                $location.path('/stories');
            })
            .error(function (data, status) {
                if (status === 401) {
                    loggedinService.loggedin = false;
                    $scope.failedloginattempt = true;
                } else {
                    window.alert("Error: " + data);
                }
            });
    };
}]);

aStory.controller('headerController', ['$scope', '$rootScope', '$location', 'loggedinService', 'logoutService', function ($scope, $rootScope, $location, loggedinService, logoutService) {
    var i;

    $rootScope.$on("$routeChangeStart", function () {
        if ($location.path() === '/login' || $location.path() === '/register' || $location.path() === '/preview') {
            $scope.loginpage = true;
        } else {
            $scope.loginpage = false;
        }
    });

    $scope.accountinfo = loggedinService.accountinfo;
    $scope.loggedin = loggedinService.loggedin;

    /**
     * Updates the scope when the loggedin variable changes.
     */
    $scope.$watch(
        function () {
            return loggedinService.loggedin;
        },

        function (newVal) {
            $scope.loggedin = newVal;
        }
    );

    /**
     * Updates the scope when the accountinfo changes.
     */
    $scope.$watch(
        function () {
            return loggedinService.accountinfo;
        },
        function (newVal) {
            $scope.accountinfo = newVal;
        },
        true
    );

    /**
     * Logs the user out and redirects them to the login page.
     */
    $scope.logout = function () {
        logoutService.logout.get(function () {
            loggedinService.loggedin = false;
            for (i = 0; i < loggedinService.accountinfo.length; i++) {
                loggedinService.accountinfo[i] = null;
            }
            $location.path('/login');
        }, function (status) {
            window.alert("Error: " + status);
        });
    };

    /**
     * Used together with ng-show in the HTML to swap visibility.
     * @param visible   Whether the element is already visible or not.
     * @returns {boolean}   The new visibility.
     */
    $scope.swapvisibility = function (visible) {
        if (visible) {
            return false;
        }
        return true;
    };


    /**
     * Swaps the background colors for the account dropdown menu.
     * @param currentlyvisible  Whether the menu is visible or not.
     */
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
    };
}]);

aStory.controller('createstorypopupController', ['$scope', '$modalInstance', 'storiesService', function ($scope, $modalInstance, storiesService) {
    $scope.close = function () {
        $modalInstance.dismiss();
    };

    /**
     * Adds a story with the given name to the database.
     * @param storyname The story's name.
     */
    $scope.addStory = function (storyname) {
        storiesService.stories.save({name: storyname}, function (data) {
            if (data.err !== null) {
                window.alert(data.err);
            } else {
                $modalInstance.close(true);
            }
        });
    };
}]);

aStory.controller('storypopupController', ['$scope', '$modal', '$modalInstance', 'storiesService', 'currentStoryService', function ($scope, $modal, $modalInstance, storiesService, currentStoryService) {
    var story = currentStoryService.currentstory;
    $scope.storyname = story.name;

    $scope.close = function () {
        $modalInstance.close();
    };

    /**
     * Saves the story with a new name.
     * @param storyname The new name for the story.
     */
    $scope.saveStory = function (storyname) {
        storiesService.stories.update({_id: story._id}, {name: storyname}, function () {
            currentStoryService.currentstory.name = storyname;
            $modalInstance.close("updated");
        }, function () {
            window.alert("Error while updating, please try again");
        });
    };

    /**
     * Shows a confirm popup and then deletes the story from the database if the user agrees.
     */
    $scope.deleteStory = function () {
        var modalInstance = $modal.open({
            templateUrl: '../partials/confirmdeletepopup.html',
            controller: 'confirmdeletepopupcontroller',
            resolve: {
                name: function () {
                    return story.name;
                }
            }
        });

        modalInstance.result.then(function (confirm) {
            if (confirm) {
                storiesService.stories.delete({_id : story._id}, function (data) {
                    if (data.err === null) {
                        $modalInstance.close("deleted");
                    } else {
                        window.alert("Error while deleting : " + data.err);
                        $modalInstance.close(false);
                    }
                });
            }
        });
    };
}]);

aStory.controller('confirmdeletepopupcontroller', ['$scope', '$modalInstance', 'name', function ($scope, $modalInstance, name) {
    $scope.name = name;

    $scope.close = function () {
        $modalInstance.close(false);
    };

    $scope.confirm = function () {
        $modalInstance.close(true);
    };
}]);


aStory.controller('overviewController', ['$scope', '$modal', 'storiesService', '$location', 'currentStoryService', function ($scope, $modal, storiesService, $location, currentStoryService) {
    storiesService.stories.get(function (data) {
        $scope.stories = data.doc;
    });

    function refreshStories() {
        storiesService.stories.get(function (data) {
            $scope.stories = data.doc;
        });
    }

    /**
     * Shows the popup to create a new story.
     */
    $scope.showCreateStoryPopup = function () {
        var modalInstance = $modal.open({
            templateUrl: '../partials/createstorypopup.html',
            controller: 'createstorypopupController',
            resolve: {
            }
        });

        modalInstance.result.then(function (newstory) {
            if (newstory) {
                refreshStories();
            }
        });
    };

    /**
     * Shows the popup to edit a story.
     * @param index The index of the story you want to edit.
     */
    $scope.showStoryPopup = function (index) {
        currentStoryService.currentstory = $scope.stories[index];
        var modalInstance = $modal.open({
            templateUrl: '../partials/storypopup.html',
            controller: 'storypopupController',
            resolve: {
            }
        });

        modalInstance.result.then(function (action) {
            if (action === "updated" || action === "deleted") {
                refreshStories();
            }
        });
    };

    /**
     * Opens a story in the editor.
     * @param index The index of the story you want to open.
     */
    $scope.openStory = function (index) {
        currentStoryService.currentstory = $scope.stories[index];
        $location.path('/editor');
    };
}]);

aStory.controller('scenariopopupController', ['$scope', '$modalInstance', 'story', 'scenariosService', function ($scope, $modalInstance, story, scenariosService) {
    $scope.close = function () {
        $modalInstance.close();
    };

    /**
     * Adds a new scenario to the current story in the database.
     * @param scenarioname  The scenario's name.
     */
    $scope.addScenario = function (scenarioname) {
        scenariosService.scenarios.save({storyid: story._id}, {name: scenarioname}, function () {
            $modalInstance.close(true);
        }, function () {
            window.alert("Error while adding scenario, please try again.");
        });
    };

}]);

aStory.controller('accountController', ['$scope', 'loggedinService', function ($scope, loggedinService) {
    $scope.accountinfo = loggedinService.accountinfo;
}]);

aStory.controller('previewController', ['$scope', function ($scope) {
}]);