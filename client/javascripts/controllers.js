/*jslint node: true, plusplus: true, todo: true  */
/*globals  */

"use strict";

aStory.controller('mainController', ['$scope', function ($location, $scope, $http) {


}]);

aStory.controller('editorController', ['$scope', function ($scope) {
    $scope.swapvisibility = function(visible){
        if(visible){
            return false
        }else{
            return true;
        }
    };

    $scope.setDropdownColor = function(id, visible){
        if(visible){
           document.getElementById(id).style.backgroundColor = "white";
        } else {
            document.getElementById(id).style.backgroundColor = "#f5f5f5";
        }
    };

    $scope.assetgroups = [
        {
            name: "Most used assets",
            assets: [
                {
                    "name": "Kerstboom",
                    "description": "Kerstboom",
                    "image": "Boom.png"
                },
                {
                    "name": "Hond",
                    "description": "Keeshond",
                    "image": "Hond.png"
                },
                {
                    "name": "Rendier",
                    "description": "Rendier",
                    "image": "Rendier.png"
                },
                {
                    "name": "Sneeuwpop",
                    "description": "Sneeuwpop",
                    "image": "Sneeuwpop.png"
                },
                {
                    "name": "Achtergrond1A",
                    "description": "Sneeuwbergen achtergrond",
                    "image": "Achtergrond1A.png"
                },
                {
                    "name": "Spaceshuttle",
                    "description": "Spaceshuttle",
                    "image": "Spaceshuttle.png"
                }
            ]
        },
        {
            name: "Characters",
            assets: [
                {
                    "name": "Hond",
                    "description": "Keeshond",
                    "image": "Hond.png"
                },
                {
                    "name": "Rendier",
                    "description": "Rendier",
                    "image": "Rendier.png"
                },
                {
                    "name": "Sneeuwpop",
                    "description": "Sneeuwpop",
                    "image": "Sneeuwpop.png"
                }
            ]
        },
        {
            name: "Huizen",
            assets: [
                {
                    "name": "Wit huisje",
                    "description": "Wit huisje",
                    "image": "Huis1.png"
                },
                {
                    "name": "Wit huisje 2",
                    "description": "Wit huisje v2",
                    "image": "Huis2.png"
                },
                {
                    "name": "Bruin huisje",
                    "description": "Bruin huisje",
                    "image": "Huis3.png"
                },
                {
                    "name": "Bruin huisje 2",
                    "description": "Bruin huisje v2",
                    "image": "Huis4.png"
                },
                {
                    "name": "Mooi huis",
                    "description": "Mooi huisje",
                    "image": "6_huis.png"
                }
            ]
        }
    ];
}]);