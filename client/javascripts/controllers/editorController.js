/*jslint  nomen: true, node: true, plusplus: true, browser: true, todo: true */
/*globals aStory, window, document,*/

aStory.controller('editScenarioController', ['$scope', 'scenario', '$modalInstance', 'scenarioService', function ($scope, scenario, $modalInstance, scenarioService) {
    "use strict";
    $scope.scenario = scenario;
    $scope.newdata = {
        name: $scope.scenario.title
    };

    $scope.close = function () {
        $modalInstance.close(false);
    };

    $scope.saveScenario = function () {
        scenarioService.scenario.update({scenarioid: scenario._id}, {name: $scope.newdata.name}, function () {
            $modalInstance.close(true);
        }, function () {
            $scope.addAlert("error", "Error while updating scenario, please try again");
        });
    };

}]);

aStory.controller('editorController', ['$scope', '$modal', 'storiesService', '$location', 'currentStoryService', 'scenariosService', 'scenesService', 'sceneService', 'scenarioService', function ($scope, $modal, storiesService, $location, currentStoryService, scenariosService, scenesService, sceneService, scenarioService) {
    var lastscenedragx, scenedragged = false, lastscenariodragy, scenariodragged = false, savingscene = false, canvasstate, refreshScenarios,
        editor = document.getElementById('editor');

    function allowDrop(event) {
        event.preventDefault();
    }

    function isBackgroundAsset(imagepath) {
        var backgroundassets, i;
        for (i = 0; i < $scope.assetgroups.length; i++) {
            if ($scope.assetgroups[i].name === "Backgrounds") {
                backgroundassets = $scope.assetgroups[i].assets;
                break;
            }
        }

        if (backgroundassets !== null) {
            for (i = 0; i < backgroundassets.length; i++) {
                if ("images/Assets/" + backgroundassets[i].image === imagepath) {
                    return true;
                }
            }
        }

        return false;
    }

    function updateServerAssets(callback) {
        if (!savingscene) {
            savingscene = true;
            var newshapes = [], i, shape, newshape;
            for (i = 0; i < canvasstate.shapes.length; i++) {
                shape = canvasstate.shapes[i];
                newshape = {
                    x: shape.x,
                    y: shape.y,
                    width: shape.w,
                    height: shape.h,
                    assetoption: shape.assetoption,
                    imagepath: shape.imgNew.src
                };
                newshapes.push(newshape);
            }
            sceneService.scene.update({sceneid: $scope.currentscene._id}, {assets: newshapes}, function (data) {
                $scope.currentscene.assets = data.doc.assets;
                savingscene = false;
                if (callback !== undefined && callback !== null) {
                    callback();
                }
            }, function (err) {
                savingscene = false;
                console.log("Error while saving assets: " + err);
            });
        }

    }

    function Asset(x, y, imgpath, state, w, h, assetoption) {
        this.imgNew = new Image();
        this.imgNew.src = imgpath;
        this.x = x || 0;
        this.y = y || 0;
        this.w = w;
        this.h = h;
        this.assetoption = assetoption;
        this.state = state;
        var that = this;

        function onImageLoad() {
            /*jshint validthis: true */
            if (w === undefined || h === undefined) {
                if (this.width > this.height) {
                    while (this.width > 500) {
                        this.width = this.width / 2;
                        this.height = this.height / 2;
                    }
                } else {
                    while (this.height > 500) {
                        this.height = this.height / 2;
                        this.width = this.width / 2;
                    }
                }
                that.w = this.width;
                that.h = this.height;
            }
            var canvas = document.getElementById('editor');
            if (canvas !== null && canvas !== undefined) {
                canvasstate.valid = false;
                canvasstate.draw();
            }
        }

        this.imgNew.onload = onImageLoad;

    }


    function dropAsset(event) {
        event.preventDefault();
        var assetmenu = document.getElementById('assetmenu'),
            editorbar = document.getElementById('editorbar'),
            navbar = document.getElementById('navbar'),
            assetx,
            assety,
            imagepath;

        if (!isBackgroundAsset(event.dataTransfer.getData("imagepath"))) {

            assetx = event.pageX - parseInt(window.getComputedStyle(assetmenu, null).width, 10) - parseInt(window.getComputedStyle(assetmenu, null).paddingLeft, 10) - parseInt(window.getComputedStyle(assetmenu, null).paddingRight, 10);
            assety = event.pageY - parseInt(window.getComputedStyle(editorbar, null).height, 10) - parseInt(window.getComputedStyle(navbar, null).height, 10);
            canvasstate.addShape(new Asset(assetx, assety, event.dataTransfer.getData("imagepath"), canvasstate));
            updateServerAssets();
        } else {
            imagepath = event.dataTransfer.getData("imagepath");
            sceneService.scene.update({sceneid: $scope.currentscene._id}, {background: imagepath}, function (data) {
                editor.style.backgroundImage = "url('../" + data.doc.background + "')";
                $scope.currentscene.background = imagepath;
                $scope.redrawCanvas();
            }, function (err) {
                window.alert("Failed to update background, please try again.");
                console.log("Error while updating background: " + err);
            });
        }

    }


    editor.addEventListener('dragover', allowDrop);
    editor.addEventListener('drop', dropAsset);

    $scope.story = currentStoryService.currentstory;
    if ($scope.story === null || $scope.story === undefined) {
        window.alert("Geen story geselecteerd");
        $location.path('/stories');
    }


    $scope.showassetproperties = false;
    $scope.selectedAsset = null;

    $scope.alerts = [
    ];

    $scope.addAlert = function (type, message) {
        $scope.alerts.push({type: type, msg: message});
        setTimeout(function () {
            $scope.closeAlert();
        }, 3000);
    };

    $scope.closeAlert = function () {
        $scope.alerts.splice(0, 1);
        $scope.redrawCanvas();
    };


    function hasLinktoOption(asset) {
        if (asset.assetoption !== undefined && asset.assetoption !== null) {
            if (asset.assetoption.type !== undefined && asset.assetoption.type !== null) {
                if (asset.assetoption.type === "Scenario") {
                    return true;
                }
            }
        }
        return false;
    }

    function updateSingleScenarioLinks(index) {
        $scope.scenarios[index].linkto = [];
        $scope.scenarios[index].linkfrom = [];
        var scenarioindex = index, b, c, d, currentasset;
        scenesService.scenes.get({scenarioid: $scope.scenarios[index]._id}, function (data) { //Haal de scenes van het scenario op

            for (b = 0; b < data.doc.length; b++) { //Ga elke scene na, kijk of er een link naar een scenario in zit

                for (c = 0; c < data.doc[b].assets.length; c++) { // Elke asset van de huidige scene nagaan
                    currentasset = data.doc[b].assets[c];

                    if (currentasset.assetoption !== undefined && currentasset.assetoption !== null) {
                        if (currentasset.assetoption.type === "Scenario") { //Deze asset linkt naar een scenario toe, voeg een from-blokje toe aan het betreffende scenario.

                            for (d = 0; d < $scope.scenarios.length; d++) {//Zoek naar welk scenario deze asset linkt
                                if (currentasset.assetoption.scenarioid === $scope.scenarios[d]._id) { //Betreffende scenario gevonden, voeg een from blokje toe en voeg een to-blokje toe aan dit scenario
                                    if ($scope.scenarios[d].linkfrom.indexOf(scenarioindex + 1) === -1) {
                                        $scope.scenarios[d].linkfrom.push(scenarioindex + 1);
                                    }
                                    if ($scope.scenarios[scenarioindex].linkto.indexOf(d + 1) === -1) {
                                        $scope.scenarios[scenarioindex].linkto.push(d + 1);
                                    }
                                    break;
                                }
                            }

                        }
                    }

                }

            }

        }, function (err) {
            window.alert("Failed to refresh scenario links");
            console.log(err);
        });
    }

    function updateAllScenarioLinks() {
        var i;
        for (i = 0; i < $scope.scenarios.length; i++) { //Elk scenario afgaan
            updateSingleScenarioLinks(i);
        }

    }

    function setLinkedScenarioName() {
        var selectedAsset = $scope.selectedAsset, b;
        if (selectedAsset.assetoption !== undefined && selectedAsset.assetoption !== null) {
            if (selectedAsset.assetoption.type === "Scenario") {
                for (b = 0; b < $scope.scenarios.length; b++) {
                    if ($scope.scenarios[b]._id === selectedAsset.assetoption.scenarioid) {
                        selectedAsset.assetoption.name = $scope.scenarios[b].name;
                        break;
                    }
                    if (b === $scope.scenarios.length - 1) {
                        selectedAsset.assetoption.name = "";
                    }
                }
            }
        }
    }


    $scope.addNextSceneAction = function () {
        var hadScenarioAction = false;
        //Kijk of de vorige actie een scenario actie was, dan moet de lijst met scenarioacties namelijk opnieuw worden gevuld
        if (hasLinktoOption($scope.selectedAsset)) {
            hadScenarioAction = true;
        }

        $scope.selectedAsset.assetoption = {
            name: "Next",
            type: "Scene"
        };
        $scope.addAlert("success", "Link to next scene has been added.");
        if (!hadScenarioAction) {
            updateServerAssets();
        } else {
            updateServerAssets(function () {
                updateAllScenarioLinks();
                setLinkedScenarioName();
            });
        }
    };

    $scope.addPreviousSceneAction = function () {
        var hadScenarioAction = false;
        if (hasLinktoOption($scope.selectedAsset)) {
            hadScenarioAction = true;
        }
        $scope.selectedAsset.assetoption = {
            name: "Previous",
            type: "Scene"
        };
        $scope.addAlert("success", "Link to previous scene has been added.");
        if (!hadScenarioAction) {
            updateServerAssets();
        } else {
            updateServerAssets(function () {
                updateAllScenarioLinks();
                setLinkedScenarioName();
            });
        }

    };

    $scope.addScenarioEvent = function (index) {
        $scope.safeApply(function () {
            $scope.selectedAsset.assetoption = {
                name: "",
                type: "Scenario",
                scenarioid: $scope.scenarios[index]._id
            };
            updateServerAssets(function () {
                updateAllScenarioLinks();
                setLinkedScenarioName();
            });
            $scope.addAlert("success", "Scenario: " + $scope.scenarios[index].name + " is toegevoegd als assetoptie!");
        });
    };

    $scope.onSceneMouseDown = function (event) {
        scenedragged = false;
        lastscenedragx = event.pageX;
    };

    $scope.onSceneMouseUp = function (event) {
        if (event.pageX < lastscenedragx - 5 || event.pageX > lastscenedragx + 5) {
            scenedragged = true;
        }
    };

    $scope.onScenarioMouseDown = function (event) {
        scenariodragged = false;
        lastscenariodragy = event.pageY;
    };

    $scope.onScenarioMouseUp = function (event) {
        if (event.pageY > lastscenariodragy + 5 || event.pageY < lastscenariodragy - 5) {
            scenariodragged = true;
        }
    };

    function makeFirstScenario() {
        scenariosService.scenarios.save({storyid: $scope.story._id}, {name: "My first scenario"}, function () {
            storiesService.stories.get({_id: $scope.story._id}, function (data) {
                $scope.story.scenarioorder = data.doc.scenarioorder;
                refreshScenarios(true);
            }, function (err) {
                $scope.addAlert("error", "Failed to refresh scenarios");
                console.log(err);
            });
        }, function (error) {
            $scope.addAlert("error", "Error while adding scenario, please try again");
            console.log(error);
        });
    }


    $scope.loadScene = function (index) {
        if (!scenedragged) {
            console.log("Loading scene: " + index);
            canvasstate.loadScene($scope.scenes[index]);
            editor.style.backgroundImage = "url('../" + $scope.scenes[index].background + "')";
            $scope.currentSceneindex = index + 1;
        } else {
            scenedragged = false;
        }

    };

    function loadScenes(firstload) {
        var i, b;
        scenesService.scenes.get({scenarioid: $scope.currentscenario._id}, function (data) {
            if (data.doc.length === 0) {
                scenesService.scenes.save({scenarioid: $scope.currentscenario._id}, {}, function (data) {
                    if (firstload) {
                        $scope.currentscenario.sceneorder.push(data.doc._id);
                        loadScenes(true);
                    }
                }, function (err) {
                    $scope.addAlert("error", "Error while trying to make the first scene");
                    console.log(err);
                });
            } else {
                $scope.scenes = [];
                for (i = 0; i < $scope.currentscenario.sceneorder.length; i++) {
                    for (b = 0; b < data.doc.length; b++) {
                        if ($scope.currentscenario.sceneorder[i] === data.doc[b]._id) {
                            $scope.scenes.push(data.doc[b]);
                            break;
                        }
                    }
                }
                //$scope.scenes = data.doc;
                if (firstload) {
                    $scope.currentscene = $scope.scenes[0];
                    $scope.loadScene(0);
                    updateAllScenarioLinks();
                } else {
                    if ($scope.currentscene !== undefined && $scope.currentscene !== null) {
                        for (i = 0; i < $scope.scenes.length; i++) {
                            if ($scope.scenes[i]._id === $scope.currentscene._id) {
                                $scope.loadScene(i);
                                break;
                            }
                            if (i === $scope.scenes.length - 1) {
                                $scope.currentscene = $scope.scenes[0];
                                $scope.loadScene(0);
                            }
                        }
                    }
                }
            }
        }, function (err) {
            $scope.addAlert("error", "Failed to get scenes");
            console.log(err);
        });
    }

    refreshScenarios = function (openstory) {
        var i, b;
        scenariosService.scenarios.get({storyid: $scope.story._id}, function (data) {
            if (data.doc.length === 0) {
                makeFirstScenario();
                return 0;
            }

            $scope.scenarios = [];
            for (i = 0; i < $scope.story.scenarioorder.length; i++) {
                for (b = 0; b < data.doc.length; b++) {
                    if (data.doc[b]._id === $scope.story.scenarioorder[i]) {
                        $scope.scenarios.push(data.doc[b]);
                        break;
                    }
                }
            }

            if (openstory) {
                $scope.currentscenario = $scope.scenarios[0];
                loadScenes(true);
            } else {
                for (i = 0; i < $scope.scenarios.length; i++) {
                    if ($scope.scenarios[i]._id === $scope.currentscenario._id) {
                        $scope.currentscenario = $scope.scenarios[i]; //De naam is geupdate, currentscenario moet opnieuw gezet worden.
                        updateAllScenarioLinks();
                        break;
                    }
                    if (i === ($scope.scenarios.length - 1)) { //Het huidige scenario bestaat blijkbaar niet, laad de eerste.
                        $scope.currentscenario = $scope.scenarios[0];
                        loadScenes(true);
                        updateAllScenarioLinks();
                    }
                }
            }
        }, function (err) {
            $scope.addAlert("error", "Error while retrieving scenarios, please refresh");
            console.log(err);
        });
    };

    refreshScenarios(true);


    $scope.openScenario = function (index) {
        if (!scenariodragged) {
            $scope.currentscenario = $scope.scenarios[index];
            loadScenes(true);
        } else {
            scenariodragged = false;
        }
    };

    $scope.removeSelectedAsset = function () {
        var hadScenariolink = false;
        if (hasLinktoOption($scope.selectedAsset)) {
            $scope.selectedAsset.assetoption = [];
            hadScenariolink = true;
        }
        canvasstate.removeAsset($scope.selectedAsset);
        if (hadScenariolink) {
            updateServerAssets(function () {
                updateAllScenarioLinks();
            });
        } else {
            updateServerAssets();
        }

    };

    $scope.onAssetKeyUp = function (key) {
        if (key === 13) {
            $scope.redrawCanvas();
        }
    };

    $scope.redrawCanvas = function () {
        $scope.safeApply(function () {
            if ($scope.selectedAsset !== null) {
                $scope.selectedAsset.h = parseInt($scope.selectedAsset.h, 10);
                $scope.selectedAsset.w = parseInt($scope.selectedAsset.w, 10);
                $scope.selectedAsset.x = parseInt($scope.selectedAsset.x, 10);
                $scope.selectedAsset.y = parseInt($scope.selectedAsset.y, 10);
            }
            canvasstate.positionAssetPropertiesMenu();
            canvasstate.valid = false;
            canvasstate.draw();
        });
    };

    $scope.showStoryPopup = function () {
        var modalInstance = $modal.open({
            templateUrl: '../partials/storypopup.html',
            controller: 'storypopupController',
            resolve: {
            }
        });

        modalInstance.result.then(function (action) {
            if (action === "deleted") {
                $location.path('/stories');
            }
        });

    };
    // $scope.showpopup = true;

    $scope.showScenarioEditPopup = function (index) {
        var modalInstance = $modal.open({
            templateUrl: '../partials/editscenariopopup.html',
            controller: 'editScenarioController',
            resolve: {
                scenario: function () {
                    return $scope.scenarios[index];
                }
            }
        });

        modalInstance.result.then(function (updated) {
            if (updated) {
                refreshScenarios(false);
            }
        });
    };

    $scope.setEditorbarDropdownColor = function (id, currentlyvisible) {
        var i, editorbarbuttons;
        if (currentlyvisible) { //Will be invisible soon
            document.getElementById(id).style.backgroundColor = document.getElementById('editorbar').style.backgroundColor;
        } else { //Will become visible soon
            editorbarbuttons = document.getElementsByClassName('editorbarbutton');
            for (i = 0; i < editorbarbuttons.length; i++) {
                editorbarbuttons[i].style.backgroundColor = document.getElementById('editorbar').style.backgroundColor;
            }
            $scope.showscenarios = false;
            document.getElementById(id).style.backgroundColor = "#ffffff";
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
                    "name": "Spaceshuttle",
                    "description": "Spaceshuttle",
                    "image": "Spaceshuttle.png"
                },
                {
                    "name": "Tijdelijk",
                    "description": "Testobject",
                    "image": "tijdelijk.PNG"
                },
                {
                    "name": "Appel",
                    "description": "Appel",
                    "image": "Appel.png"
                },
                {
                    "name": "Banaan",
                    "description": "Banaan",
                    "image": "Banaan.png"
                },
                {
                    "name": "boom2",
                    "description": "Boom 2",
                    "image": "boom2.png"
                },
                {
                    "name": "Druiven",
                    "description": "Druiven",
                    "image": "Druiven.png"
                },
                {
                    "name": "Gingerbread huis",
                    "description": "Gingerbread huis",
                    "image": "Gingerbread%20huis.png"
                },
                {
                    "name": "Maan",
                    "description": "Maan",
                    "image": "Maan.png"
                },
                {
                    "name": "Pinguïn",
                    "description": "Pinguïn",
                    "image": "Pinguin.png"
                },
                {
                    "name": "Schaap",
                    "description": "Schaap",
                    "image": "Schaap.png"
                },
                {
                    "name": "Vissersboot",
                    "description": "Vissersboot",
                    "image": "Vissersboot.png"
                },
                {
                    "name": "Wolk",
                    "description": "Wolk",
                    "image": "Wolk.png"
                },
                {
                    "name": "Zon",
                    "description": "Zon",
                    "image": "Zon.png"
                }
            ]
        },
        {
            name: "Backgrounds",
            assets: [
                {
                    "name": "Achtergrond1B",
                    "description": "Sneeuwbergen achtergrond geen wolken",
                    "image": "Achtergrond1B.png"
                },
                {
                    "name": "Achtergrond2",
                    "description": "Nacht zonsopgang achtergrond",
                    "image": "Achtergrond2.png"
                },
                {
                    "name": "Achtergrond3",
                    "description": "Sneeuw achtergrond",
                    "image": "Achtergrond3.png"
                },
                {
                    "name": "Achtergrond1A",
                    "description": "Sneeuwbergen achtergrond",
                    "image": "Achtergrond1A.png"
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
                },
                {
                    "name": "Pinguïn",
                    "description": "Pinguïn",
                    "image": "Pinguin.png"
                },
                {
                    "name": "Schaap",
                    "description": "Schaap",
                    "image": "Schaap.png"
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
                },
                {
                    "name": "Gingerbread huis",
                    "description": "Gingerbread huis",
                    "image": "Gingerbread huis.png"
                }
            ]
        },
        {
            name: "Fruit",
            assets: [
                {
                    "name": "Druiven",
                    "description": "Druiven",
                    "image": "Druiven.png"
                },
                {
                    "name": "Appel",
                    "description": "Appel",
                    "image": "Appel.png"
                },
                {
                    "name": "Banaan",
                    "description": "Banaan",
                    "image": "Banaan.png"
                }
            ]
        }
    ];


    $scope.addScene = function () {
        scenesService.scenes.save({scenarioid: $scope.currentscenario._id}, {}, function () {
            refreshScenarios(false);
            loadScenes();
            $scope.addAlert("success", "Scene added");
        }, function (err) {
            $scope.addAlert("error", "Error while adding scene");
            console.log(err);
        });
    };

    $scope.addSceneByIndex = function (index) {
        var sceneorderlocal = [], i;
        scenesService.scenes.save({scenarioid: $scope.currentscenario._id}, {}, function () {

            scenarioService.scenario.get({scenarioid: $scope.currentscenario._id}, function (scenariodata) {
                sceneorderlocal = [];
                for (i = 0; i < scenariodata.doc.sceneorder.length - 1; i++) {
                    if (i === index) {
                        sceneorderlocal.push((scenariodata.doc.sceneorder[scenariodata.doc.sceneorder.length - 1]));
                    }
                    sceneorderlocal.push(scenariodata.doc.sceneorder[i]);
                }
                scenarioService.scenario.update({scenarioid: $scope.currentscenario._id}, {sceneorder: sceneorderlocal}, function () {
                    refreshScenarios(false);
                    loadScenes();
                    $scope.addAlert("success", "Scene added");
                }, function (err) {
                    window.alert("Failed to save new scene order, your scene has been added to the back");
                    console.log(err);
                });
            }, function (error) {
                window.alert("Failed to refresh scenes");
                console.log(error);
            });

            // $scope.addAlert("success", "Scene added");
        }, function (err) {
            $scope.addAlert("error", "Error while adding scene");
            console.log(err);
        });

        /*$scope.scenes.splice(index, 0, {
         "image": "johndoe.png"
         });
         $scope.addAlert("success", "Scene added"); */
    };

    $scope.deleteScene = function () {
        var modalInstance = $modal.open({
            templateUrl: '../partials/confirmdeletepopup.html',
            controller: 'confirmdeletepopupcontroller',
            resolve: {
                name: function () {
                    return "Scene";
                }
            }
        });

        modalInstance.result.then(function (response) {
            var hadScenariolinkoption, i, currentasset;
            if ($scope.scenes.length === 0 && response) {
                $scope.addAlert("error", "Cannot remove last scene");
                loadScenes(false);
                $scope.deleteList = [];
            } else if (response) {
                hadScenariolinkoption = false;
                //Controleer of er assets waren in de scene die naar scenarios linkten
                for (i = 0; i < $scope.deleteList[0].assets.length; i++) {
                    currentasset = $scope.deleteList[0].assets[i];
                    if (currentasset.assetoption !== undefined && currentasset.assetoption !== null) {
                        if (currentasset.assetoption.type !== undefined && currentasset.assetoption.type !== null) {
                            if (currentasset.assetoption.type === "Scenario") {
                                hadScenariolinkoption = true;
                            }
                        }
                    }
                }

                sceneService.scene.delete({sceneid: $scope.deleteList[0]._id}, function () {
                    $scope.addAlert("success", "Scene deleted");
                    loadScenes(false);
                    if (hadScenariolinkoption) {
                        updateAllScenarioLinks();
                    }
                }, function (err) {
                    $scope.addAlert("error", "Failed to delete scene");
                    console.log(err);
                    loadScenes(false);
                });
                $scope.deleteList = [];

            } else {
                loadScenes(false);
                $scope.deleteList = [];
            }
        });

    };

    function deleteDraggedScenario() {
        var modalInstance = $modal.open({
            templateUrl: '../partials/confirmdeletepopup.html',
            controller: 'confirmdeletepopupcontroller',
            resolve: {
                name: function () {
                    return "Scenario";
                }
            }
        });

        modalInstance.result.then(function (response) {
            if (response) {
                scenarioService.scenario.delete({scenarioid: $scope.deleteList[0]._id}, function () {
                    refreshScenarios(false);
                    $scope.addAlert("success", "Scenario deleted");
                }, function (err) {
                    refreshScenarios(false);
                    $scope.addAlert("error", "Failed to delete scenario");
                    console.log(err);
                });
                $scope.deleteList = [];
            } else {
                refreshScenarios(false);
                $scope.deleteList = [];
            }
        });
    }

    $scope.showScenarioPopup = function () {
        var scenariopopup = $modal.open({
            templateUrl: '../partials/createscenariopopup.html',
            controller: 'scenariopopupController',
            resolve: {
                story: function () {
                    return $scope.story;
                }
            }
        });

        scenariopopup.result.then(function (updated) {
            var i;
            if (updated) {
                storiesService.stories.get(function (data) {
                    for (i = 0; i < data.doc.length; i++) {
                        if (data.doc[i]._id === $scope.story._id) {
                            $scope.story.scenarioorder = data.doc[i].scenarioorder;
                            break;
                        }
                    }
                    refreshScenarios(false);
                }, function (err) {
                    console.log(err);
                    $scope.addAlert("error", "Failed to refresh scenarios");
                });

            }
        });
    };

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof fn === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    /* Drag and drop zooi */

    function SelectionBox(x, y, state) {
        this.state = state;
        this.x = x || 0;
        this.y = y || 0;
    }


    // Draws this shape to a given context
    Asset.prototype.draw = function (ctx) {
        var i, cur, half,
            locx = this.x,
            locy = this.y;

        if (this.state.selection === this) {
            ctx.strokeStyle = this.state.selectionColor;
            ctx.lineWidth = this.state.selectionWidth;
            ctx.strokeRect(this.x, this.y, this.w, this.h);

            half = this.state.selectionboxsize / 2;
            // 0 1 2
            // 3   4
            // 5 6 7
            this.state.selectionHandles[0].x = this.x - half;
            this.state.selectionHandles[0].y = this.y - half;

            this.state.selectionHandles[1].x = this.x + this.w / 2 - half;
            this.state.selectionHandles[1].y = this.y - half;

            this.state.selectionHandles[2].x = this.x + this.w - half;
            this.state.selectionHandles[2].y = this.y - half;

            //middle left
            this.state.selectionHandles[3].x = this.x - half;
            this.state.selectionHandles[3].y = this.y + this.h / 2 - half;

            //middle right
            this.state.selectionHandles[4].x = this.x + this.w - half;
            this.state.selectionHandles[4].y = this.y + this.h / 2 - half;

            //bottom left, middle, right
            this.state.selectionHandles[6].x = this.x + this.w / 2 - half;
            this.state.selectionHandles[6].y = this.y + this.h - half;

            this.state.selectionHandles[5].x = this.x - half;
            this.state.selectionHandles[5].y = this.y + this.h - half;

            this.state.selectionHandles[7].x = this.x + this.w - half;
            this.state.selectionHandles[7].y = this.y + this.h - half;

            for (i = 0; i < 8; i += 1) {
                cur = this.state.selectionHandles[i];
                ctx.fillRect(cur.x, cur.y, this.state.selectionboxsize, this.state.selectionboxsize);
            }
        }

        ctx.drawImage(this.imgNew, locx, locy, this.w, this.h);
    };

    // Determine if a point is inside the shape's bounds
    Asset.prototype.contains = function (mx, my) {
        // All we have to do is make sure the Mouse X,Y fall in the area between
        // the shape's X and (X + Height) and its Y and (Y + Height)
        return (this.x <= mx) && (this.x + this.w >= mx) &&
            (this.y <= my) && (this.y + this.h >= my);
    };

    function CanvasState(canvas) {
        // **** First some setup! ****
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        // This complicates things a little but but fixes mouse co-ordinate problems
        // when there's a border or padding. See getMouse for more detail
        var html, assetmenu, myState, i;
        if (document.defaultView && document.defaultView.getComputedStyle) {
            this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null).paddingLeft, 10) || 0;
            this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(canvas, null).paddingTop, 10) || 0;
            this.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(canvas, null).borderLeftWidth, 10) || 0;
            this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(canvas, null).borderTopWidth, 10) || 0;
        }

        html = document.body.parentNode;
        this.htmlTop = html.offsetTop;
        this.htmlLeft = html.offsetLeft;

        assetmenu = document.getElementById('assetmenu');
        this.assetpropertiesxoffset = parseInt(window.getComputedStyle(assetmenu).width, 0) + parseInt(window.getComputedStyle(assetmenu).paddingLeft, 0) + parseInt(window.getComputedStyle(assetmenu).paddingRight, 0);
        this.assetpropertiesyoffset = parseInt(window.getComputedStyle(document.getElementById('navbar')).height, 0) + parseInt(window.getComputedStyle(document.getElementById('editorbar')).height, 0);
        this.assetpropertiesmenuwidth = 260;
        this.assetpropertiesmenuheight = 345;
        this.assetpropertiesmenu = document.getElementById('assetmenuwrapper');
        this.valid = false; // when set to false, the canvas will redraw everything
        this.shapes = [];  // the collection of things to be drawn
        this.dragging = false; // Keep track of when we are dragging
        this.resizeDragging = false;
        this.expectResize = -1;
        // the current selected object. In the future we could turn this into an array for multiple selection
        this.selection = null;
        this.dragoffx = 0; // See mousedown and mousemove events for explanation
        this.dragoffy = 0;

        myState = this;

        this.selectionHandles = [];
        for (i = 0; i < 8; i += 1) {
            this.selectionHandles.push(new SelectionBox(0, 0, this));
        }

        //fixes a problem where double clicking causes text to get selected on the canvas
        canvas.addEventListener('selectstart', function (e) {
            e.preventDefault();
            return false;
        }, false);

        CanvasState.prototype.positionAssetPropertiesMenu = function () {
            var selection = myState.selection, assetpropertiesxoffset, assetpropertiesyoffset, assetpropertiesmenu, canvaswidth;
            if (selection !== null) {
                assetpropertiesxoffset = myState.assetpropertiesxoffset;
                assetpropertiesyoffset = myState.assetpropertiesyoffset;
                assetpropertiesmenu = myState.assetpropertiesmenu;
                canvaswidth = parseInt(window.getComputedStyle(this.canvas, null).width, 10);

                //X offset


                //Past rechts
                if (selection.x + selection.w < (canvaswidth - this.assetpropertiesmenuwidth)) {
                    assetpropertiesmenu.style.left = selection.x + assetpropertiesxoffset + selection.w + 2 + "px";
                } else if (selection.x + selection.w > canvaswidth - this.assetpropertiesmenuwidth && selection.x > this.assetpropertiesmenuwidth) { //Past niet rechts maar heeft nog wel ruimte links
                    assetpropertiesmenu.style.left = assetpropertiesxoffset + selection.x - this.assetpropertiesmenuwidth - 2 + "px";
                } else { //Past niet links, past niet rechts
                    assetpropertiesmenu.style.left = assetpropertiesxoffset + "px";
                }

                //Y offset
                if (selection.y < 0) {
                    assetpropertiesmenu.style.top = assetpropertiesyoffset + "px";
                } else if (selection.y > parseInt(window.getComputedStyle(this.canvas, null).height, 10) - this.assetpropertiesmenuheight) {
                    assetpropertiesmenu.style.top = assetpropertiesyoffset + parseInt(window.getComputedStyle(this.canvas, null).height, 10) - this.assetpropertiesmenuheight + "px";
                } else {
                    assetpropertiesmenu.style.top = selection.y + assetpropertiesyoffset + "px";
                }
            }

        };

        // Up, down, and move are for dragging
        canvas.addEventListener('mousedown', function (e) {

            var mouse = myState.getMouse(e),
                mx = mouse.x,
                my = mouse.y,
                shapes = myState.shapes,
                l = shapes.length,
                index,
                mySel,
                selectasset;

            if (myState.expectResize !== -1) {
                myState.resizeDragging = true;
                return;
            }

            selectasset = function () {
                $scope.safeApply(function () {
                    myState.positionAssetPropertiesMenu();
                    $scope.selectedAsset = shapes[index];
                    setLinkedScenarioName();
                    $scope.showassetproperties = true;
                });
            };

            for (index = l - 1; index >= 0; index--) {
                mySel = shapes[index];
                myState.dragoffx = mx - mySel.x;
                myState.dragoffy = my - mySel.y;
                myState.dragging = true;
                myState.selection = mySel;
                myState.valid = false;
                if (shapes[index].contains(mx, my)) {
                    selectasset();
                    return;
                }
            }
            // havent returned means we have failed to select anything.
            // If there was an object selected, we deselect it
            if (myState.selection) {
                $scope.safeApply(function () {
                    $scope.showassetproperties = false;
                    $scope.selectedAsset = null;
                });
                myState.selection = null;
                myState.valid = false; // Need to clear the old selection border
            }
        }, true);

        canvas.addEventListener('mousemove', function (e) {
            var mouse = myState.getMouse(e),
                mx = mouse.x,
                my = mouse.y,
                oldx,
                oldy,
                moveindex,
                cur;
            if (myState.dragging) {
                $scope.safeApply(function () {
                    $scope.showassetproperties = false;
                });
                // We don't want to drag the object by its top-left corner, we want to drag it
                // from where we clicked. Thats why we saved the offset and use it here
                myState.selection.x = mx - myState.dragoffx;
                myState.selection.y = my - myState.dragoffy;
                myState.valid = false; // Something's dragging so we must redraw
            } else if (myState.resizeDragging) {
                $scope.safeApply(function () {
                    $scope.showassetproperties = false;
                });
                oldx = myState.selection.x;
                oldy = myState.selection.y;

                // 0 1 2
                // 3   4
                // 5 6 7
                switch (myState.expectResize) {
                case 0:
                    myState.selection.x = mx;
                    myState.selection.y = my;
                    myState.selection.w += oldx - mx;
                    myState.selection.h += oldy - my;
                    break;
                case 1:
                    myState.selection.y = my;
                    myState.selection.h += oldy - my;
                    break;
                case 2:
                    myState.selection.y = my;
                    myState.selection.w = mx - oldx;
                    myState.selection.h += oldy - my;
                    break;
                case 3:
                    myState.selection.x = mx;
                    myState.selection.w += oldx - mx;
                    break;
                case 4:
                    myState.selection.w = mx - oldx;
                    break;
                case 5:
                    myState.selection.x = mx;
                    myState.selection.w += oldx - mx;
                    myState.selection.h = my - oldy;
                    break;
                case 6:
                    myState.selection.h = my - oldy;
                    break;
                case 7:
                    myState.selection.w = mx - oldx;
                    myState.selection.h = my - oldy;
                    break;
                }

                myState.valid = false; // Something's dragging so we must redraw

            }

            if (myState.selection !== null && !myState.resizeDragging) {
                for (moveindex = 0; moveindex < 8; moveindex += 1) {
                    cur = myState.selectionHandles[moveindex];
                    if (mx >= cur.x && mx <= cur.x + myState.selectionboxsize &&
                            my >= cur.y && my <= cur.y + myState.selectionboxsize) {
                        myState.expectResize = moveindex;
                        myState.valid = false;

                        switch (moveindex) {
                        case 0:
                            this.style.cursor = 'nw-resize';
                            break;
                        case 1:
                            this.style.cursor = 'n-resize';
                            break;
                        case 2:
                            this.style.cursor = 'ne-resize';
                            break;
                        case 3:
                            this.style.cursor = 'w-resize';
                            break;
                        case 4:
                            this.style.cursor = 'e-resize';
                            break;
                        case 5:
                            this.style.cursor = 'sw-resize';
                            break;
                        case 6:
                            this.style.cursor = 's-resize';
                            break;
                        case 7:
                            this.style.cursor = 'se-resize';
                            break;

                        }
                        return;
                    }

                }
                myState.resizeDragging = false;
                myState.expectResize = -1;
                this.style.cursor = 'auto';
            }
        }, true);

        canvas.addEventListener('mouseup', function () {
            myState.dragging = false;
            myState.resizeDragging = false;
            myState.expectResize = -1;
            if (myState.selection !== null && myState.selection !== undefined) {
                if (myState.selection.w < 0) {
                    myState.selection.w = -myState.selection.w;
                    myState.selection.x -= myState.selection.w;
                }
                if (myState.selection.h < 0) {
                    myState.selection.h = -myState.selection.h;
                    myState.selection.y -= myState.selection.h;
                }
                $scope.safeApply(function () {
                    myState.positionAssetPropertiesMenu();
                    $scope.showassetproperties = true;
                    updateServerAssets();
                });
            }
        }, true);

        // double click for making new shapes
        canvas.addEventListener('dblclick', function (e) {
            console.log(e);
      //      var mouse = myState.getMouse(e);
        }, true);

        // **** Options! ****

        this.selectionColor = '#CC0000';
        this.selectionWidth = 2;
        this.selectionboxsize = 6;
        this.interval = 30;
        setInterval(function () {
            myState.draw();
        }, myState.interval);
    }

    CanvasState.prototype.loadScene = function (scene) {
        var i, assets;
        if (!savingscene) {
            $scope.currentscene = scene;
            $scope.showassetproperties = false;
            this.shapes = [];
            this.clear();
            assets = scene.assets;
            if (assets !== undefined && assets !== null) {
                for (i = 0; i < assets.length; i++) {
                    canvasstate.addShape(new Asset(assets[i].x, assets[i].y, assets[i].imagepath, canvasstate, assets[i].width, assets[i].height, assets[i].assetoption));
                }
            }
        } else {
            console.log("Cannot change scene -> Currently saving scene");
        }
    };

    CanvasState.prototype.removeAsset = function (shape) {
        this.shapes.splice(this.shapes.indexOf(shape), 1);
        this.valid = false;
        $scope.safeApply(function () {
            $scope.showassetproperties = false;
            $scope.selectedAsset = null;
        });
        this.draw();
    };

    CanvasState.prototype.addShape = function (shape) {
        this.shapes.push(shape);
        this.valid = false;
    };

    CanvasState.prototype.clear = function () {
        this.ctx.clearRect(0, 0, parseInt(window.getComputedStyle(this.canvas, null).width, 10), parseInt(window.getComputedStyle(this.canvas, null).height, 10));
    };

    CanvasState.prototype.draw = function () {
        // if our state is invalid, redraw and validate!
        if (!this.valid) {
            var ctx = this.ctx,
                shapes = this.shapes,
                l,
                i,
                shape,
                outofcanvas;
            this.clear();

            // ** Add stuff you want drawn in the background all the time here **

            // draw all shapes
            l = shapes.length;
            for (i = 0; i < l; i++) {
                shape = shapes[i];
                outofcanvas = false;
                // We can skip the drawing of elements that have moved off the screen:
                if (shape.x > parseInt(window.getComputedStyle(this.canvas, null).width, 10) || shape.y > parseInt(window.getComputedStyle(this.canvas, null).height, 10) ||
                        shape.x + shape.w < 0 || shape.y + shape.h < 0) {
                    outofcanvas = true;
                }
                if (!outofcanvas) {
                    shapes[i].draw(ctx);
                }

            }

            // ** Add stuff you want drawn on top all the time here **
            this.valid = true;
        }
    };

    CanvasState.prototype.getMouse = function (e) {
        var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;

        // Compute the total offset
        if (element.offsetParent !== undefined) {
            do {
                offsetX += element.offsetLeft;
                offsetY += element.offsetTop;
            } while ((element === element.offsetParent));
        }

        // Add padding and border style widths to offset
        // Also add the <html> offsets in case there's a position:fixed bar
        offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
        offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

        mx = e.pageX - offsetX;
        my = e.pageY - offsetY;

        // We return a simple javascript object (a hash) with x and y defined
        return {x: mx, y: my};
    };

    window.addEventListener('resize', function () {
        var canvas = document.getElementById('editor');
        if (canvas !== null && canvas !== undefined) {
            canvas.setAttribute('width',  parseInt(window.getComputedStyle(canvas, null).width, 10).toString());
            canvas.setAttribute('height', parseInt(window.getComputedStyle(canvas, null).height, 10).toString());
            canvasstate.valid = false;
            canvasstate.draw();
        }
    });

    function initCanvas() {
        var canvas = document.getElementById(('editor'));
        canvas.setAttribute('width',  parseInt(window.getComputedStyle(canvas, null).width, 10).toString());
        canvas.setAttribute('height', parseInt(window.getComputedStyle(canvas, null).height, 10).toString());
        canvasstate = new CanvasState(canvas);
    }


    $scope.dragAsset = function (event) {
        event.dataTransfer.setData("imagepath", event.target.getAttribute('src'));
    };

    initCanvas();

    //Sortable
    $scope.deleteList = [];

    $scope.sortableOptionsTrash = {
        receive: function () {
            $scope.deleteScene();
        }
    };

    $scope.sortableOptionsTrashScenarios = {
        receive: function () {
            deleteDraggedScenario();
        }
    };

    $scope.sortableOptions = {
        removed: false,
        update: function () {
            this.removed = false;
        },
        remove: function () {
            this.removed = true;
        },
        stop: function () {
            var i, sceneorderlocal;
            if (!this.removed) {
                sceneorderlocal = [];
                for (i = 0; i < $scope.scenes.length; i++) {
                    sceneorderlocal.push($scope.scenes[i]._id);
                }
                scenarioService.scenario.update({scenarioid: $scope.currentscenario._id}, {sceneorder: sceneorderlocal}, function () {
                    $scope.currentscenario.sceneorder = sceneorderlocal;

                    for (i = 0; i < sceneorderlocal.length; i++) {
                        if (sceneorderlocal[i] === $scope.currentscene._id) {
                            $scope.currentSceneindex = i + 1;
                            break;
                        }
                    }
                }, function (err) {
                    console.log(err);
                    $scope.addAlert("error", "Error while updating scene order, your progress might not have been saved.");
                });
            }
        },
        containment: "#scenemenuwrapper",
        revert: true,
        opacity: 0.5,
        tolerance: "pointer",
        delay: 150,
        connectWith: "#scenetrash",
        axis: "x"
    };

    $scope.sortableOptionsScenario = {
        removed: false,
        update: function () {
            this.removed = false;
        },
        remove: function () {
            this.removed = true;
        },
        stop: function () {
            var scenarioorderlocal, i;
            if (!this.removed) {
                scenarioorderlocal = [];
                for (i = 0; i < $scope.scenarios.length; i++) {
                    scenarioorderlocal.push($scope.scenarios[i]._id);
                }
                storiesService.stories.update({_id: $scope.story._id}, {scenarioorder: scenarioorderlocal}, function (data) {
                    $scope.story.scenarioorder = data.doc.scenarioorder;
                    updateAllScenarioLinks();
                }, function (error) {
                    console.log(error);
                    $scope.addAlert("error", "Failed to update scenario order on server");
                });
            }
        },
        containment: ".editorbardropdown",
        revert: true,
        opacity: 0.5,
        delay: 150,
        connectWith: ".trashcan",
        axis: "y"
    };
}]);
