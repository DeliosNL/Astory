/*globals aStory */

aStory.directive('assetimage', function () {
    "use strict";
    return {
        link: function (scope, element) {
            element.bind("load", function () {
                element[0].addEventListener('dragstart', scope.dragAsset);
            });
        }
    };
});

aStory.directive('accountdropdown', function () {
    "use strict";
    return {
        restrict: 'E',
        templateUrl: '../partials/directives/accountdropdown.html',
        replace: true
    };
});

aStory.directive('scenariosdropdown', function () {
    "use strict";
    return {
        restrict: 'E',
        templateUrl: '../partials/directives/scenariosdropdown.html',
        replace: true
    };
});

aStory.directive('ngBlur', function () {
    "use strict";
    return function (scope, elem, attrs) {
        elem.bind('blur', function () {
            scope.$apply(attrs.ngBlur);
        });
    };
});

aStory.directive('onKeyupFn', function () {
    "use strict";
    return function (scope, elm, attrs) {
        var keyupFn = scope.$eval(attrs.onKeyupFn);
        elm.bind('keyup', function (evt) {
            scope.$apply(function () {
                keyupFn.call(scope, evt.which);
            });
        });
    };
});