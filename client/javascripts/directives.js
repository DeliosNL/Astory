aStory.directive('storypopup', function() {
    "use strict";
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        templateUrl: '../partials/storypopup.html',
        link: function (scope, element) {
        }
    };
});