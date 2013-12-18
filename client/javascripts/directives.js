aStory.directive('assetimage', function () {
    "use strict";
    return {
        link: function(scope, element, attrs) {
            element.bind("load", function(e) {
                element[0].addEventListener('dragstart', scope.dragAsset);
            });
        }
    };
});