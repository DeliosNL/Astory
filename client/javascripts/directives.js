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

aStory.directive('ngBlur', function() {
    "use strict";
    return function(scope, elem, attrs ){
        elem.bind('blur', function () {
            scope.$apply(attrs.ngBlur);
        });
    };
});

aStory.directive('onKeyupFn', function() {
    return function(scope, elm, attrs) {
        var keyupFn = scope.$eval(attrs.onKeyupFn);
        elm.bind('keyup', function(evt) {
            scope.$apply(function () {
                keyupFn.call(scope, evt.which);
            });
        });
    };
});