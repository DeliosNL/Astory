aStory.directive('storypopup', function() {
    "use strict";
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        replace: true,
        templateUrl: '../partials/storypopup.html',
        link: function (scope, element) {
        }
    };
});