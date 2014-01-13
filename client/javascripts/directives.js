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

aStory.directive('addthisToolbox', function() {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        template: '<div ng-transclude></div>',
        link: function ($scope, element, attrs) {
            // Dynamically init for performance reason
            // Safe for multiple calls, only first call will be processed (loaded css/images, popup injected)
            // http://support.addthis.com/customer/portal/articles/381263-addthis-client-api#configuration-url
            // http://support.addthis.com/customer/portal/articles/381221-optimizing-addthis-performance
            addthis.init();
            // Ajax load (bind events)
            // http://support.addthis.com/customer/portal/articles/381263-addthis-client-api#rendering-js-toolbox
            // http://support.addthis.com/customer/portal/questions/548551-help-on-call-back-using-ajax-i-lose-share-buttons
            addthis.toolbox($(element).get());
        }
    };
});