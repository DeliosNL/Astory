/*globals aStory */

/**
 * Directive for an image that can be dragged to the canvas. The directive exists to bind an event listener to the
 * image.
 */
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

/**
 * Directive containing the html of the account dropdown menu.
 */
aStory.directive('accountdropdown', function () {
    "use strict";
    return {
        restrict: 'E',
        templateUrl: '../partials/directives/accountdropdown.html',
        replace: true
    };
});

/**
 * Directive containing the html for the scenario's dropdown menu.
 */
aStory.directive('scenariosdropdown', function () {
    "use strict";
    return {
        restrict: 'E',
        templateUrl: '../partials/directives/scenariosdropdown.html',
        replace: true
    };
});

/**
 * Custom directive for using the "onblur" event together with angular.
 */
aStory.directive('ngBlur', function () {
    "use strict";
    return function (scope, elem, attrs) {
        elem.bind('blur', function () {
            scope.$apply(attrs.ngBlur);
        });
    };
});

/**
 * Custom directive for using the keyup event with an angular controller function.
 */
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