aStory.directive('assetimage', function () {
    "use strict";
    return {
        link: function (scope, element, attrs) {
            element.bind("load", function (e) {
                element[0].addEventListener('dragstart', scope.dragAsset);
            });
        }
    };
});

aStory.directive('accountdropdown', function () {
    "use strict";
    return {
        restrict: 'E',
        templateUrl: '../partials/directives/accountdropdown.html'
    };
});

aStory.directive('scenariosdropdown', function() {
    "use strict";
    return {
        restrict: 'E',
        templateUrl: '../partials/directives/scenariosdropdown.html'
    };
});