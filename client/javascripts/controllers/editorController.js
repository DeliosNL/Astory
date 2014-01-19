/*jslint  nomen: true, node: true, plusplus: true, browser: true, todo: true */
/*globals aStory, window, document,*/

/**
 * This controller is used when changing the name of a scenario.
 */
aStory.controller('editScenarioController', ['$scope', 'scenario', '$modalInstance', 'scenarioService', function ($scope, scenario, $modalInstance, scenarioService) {
    "use strict";
    $scope.scenario = scenario;
    $scope.newdata = {
        name: $scope.scenario.title
    };

    $scope.close = function () {
        $modalInstance.close(false);
    };

    /**
     * Updates the scenario's name on the server and closes the popup. Close(true) indicates that the name has been changed.
     */
    $scope.saveScenario = function () {
        scenarioService.scenario.update({scenarioid: scenario._id}, {name: $scope.newdata.name}, function () {
            $modalInstance.close(true);
        }, function () {
            $scope.addAlert("error", "Error while updating scenario, please try again");
        });
    };

}]);

/**
 * This is the controller for the /edit page. It contains all the functions necessary to make a story with scenes, scenarios, assets etc.
 */
aStory.controller('editorController', ['$scope', '$modal', 'storiesService', '$location', 'currentStoryService', 'scenariosService', 'scenesService', 'sceneService', 'scenarioService', function ($scope, $modal, storiesService, $location, currentStoryService, scenariosService, scenesService, sceneService, scenarioService) {
    var lastscenedragx, lastscenariodragy, savingscene = false, canvasstate, refreshScenarios,
        editor = document.getElementById('editor');
    $scope.scenedragged = false;
    $scope.scenariodragged = false;
    /**
     * Prevents the default behavior of the dragover event of the canvas. Without this prevention it would be impossible to drop a asset on the canvas.
     * @param event HTML 5 dragover event
     */
    function allowDrop(event) {
        event.preventDefault();
    }

    /**
     * Checks if a given imagepath is present in the "Backgrounds" asset category.
     * @param imagepath Imagepath to check.
     * @returns {boolean} true if the imagepath is a background's image path. Otherwise false.
     */
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

    function updateTextAsset() {
        var newtextHTML = document.getElementById('textassettextarea').innerHTML;
        var newtext = htmlToText(newtextHTML);
        $scope.selectedAsset.text = newtext;
        $scope.showtextassetedit = false;
        updateServerAssets();
    }

    /**
     * This function generates a new array with all the current scene's assets, this array only includes the necessary information to store in the database.
     * After generating the array the current scene's asset-array is overwritten on the server for future reference.
     * @param callback optional, if present this function will be called AFTER the update on the server has been successfull.
     */
    function updateServerAssets(callback) {
        if (!savingscene) {
            savingscene = true;
            var newshapes = [], i, shape, newshape;
            for (i = 0; i < canvasstate.shapes.length; i++) {
                shape = canvasstate.shapes[i];
                if (shape instanceof Asset) {
                    newshape = {
                        x: shape.x,
                        y: shape.y,
                        width: shape.w,
                        height: shape.h,
                        assetoption: shape.assetoption,
                        imagepath: shape.imgNew.src
                    };
                    newshapes.push(newshape);
                } else if (shape instanceof TextAsset) {
                    newshape = {
                        x: shape.x,
                        y: shape.y,
                        width: shape.w,
                        lineheight: shape.lineheight,
                        assetoption: shape.assetoption,
                        text: shape.text
                    };
                    newshapes.push(newshape);
                }
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

    /**
     * This class represents an asset on the canvas. The canvas state keeps an array filled with Assets.
     * The asset class contains all necessary info to draw the image to the canvas.
     * @param x x Position indicating where the asset has been dropped.
     * @param y y Position indicating where the asset has been dropped.
     * @param imgpath Asset's image path, a new Image will be generated from this path and drawn on the canvas.
     * @param state reference to the CanvasState.
     * @param w Optional - initial width of the asset. If not present the width will be < 500 while maintaining the original aspect ratio.
     * @param h Option - initial height of the asset. If not present the height will be < 500 while maintaining the original aspect ratio.
     * @param assetoption Optional - If the asset is loaded from the server an assetoption might be present. Save the object for future reference.
     * @constructor
     */
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



    function TextAsset(x, y, width, state, text, assetoption) {
        this.x = x;
        this.y = y;
        this.state = state;
        this.text = text;
        this.w = width;
        this.lineheight = 25;
        this.assetoption = assetoption;

        //alert(state.ctx.measureText(text).width);
    }

    TextAsset.prototype.getHeight = function () {
        var lines = this.text.split("\n"), i, n, words, line, testLine, metrics, testWidth, y = this.y,
            linecount = lines.length;
        for (i = 0; i < lines.length; i++) {
            words = lines[i].split(' ');
            line = '';

            for (n = 0; n < words.length; n++) {
                testLine = line + words[n] + ' ';
                metrics = this.state.ctx.measureText(testLine);
                testWidth = metrics.width;
                if (testWidth > this.w && n > 0) {
                    line = words[n] + ' ';
                    linecount++;
                    y += this.lineHeight;
                } else {
                    line = testLine;
                }
            }
            y += this.lineHeight;
        }
        return (linecount * this.lineheight);
    };

    TextAsset.prototype.draw = function (ctx) {
        var half, cur, i;
        if (this.state.selection === this && !$scope.showtextassetedit) {
            ctx.strokeStyle = this.state.selectionColor;
            ctx.lineWidth = this.state.selectionWidth;
            ctx.strokeRect(this.x, this.y, this.w, this.getHeight());

            for (i = 0; i < 8; i++) {
                this.state.selectionHandles[i].x = 99999;
                this.state.selectionHandles[i].y = 99999;
            }

            half = this.state.selectionboxsize / 2;
            this.state.selectionHandles[3].x = this.x - half;
            this.state.selectionHandles[3].y = this.y + this.getHeight() / 2 - half;

            //middle right
            this.state.selectionHandles[4].x = this.x + this.w - half;
            this.state.selectionHandles[4].y = this.y + this.getHeight() / 2 - half;

            cur = this.state.selectionHandles[3];
            ctx.fillRect(cur.x, cur.y, this.state.selectionboxsize, this.state.selectionboxsize);
            cur = this.state.selectionHandles[4];
            ctx.fillRect(cur.x, cur.y, this.state.selectionboxsize, this.state.selectionboxsize);
        }

        if (!$scope.showtextassetedit){
            this.wrapText(ctx, this.text, this.x, this.y, this.w, this.lineheight);
        } else if (this.state.selection !== this) {
            this.wrapText(ctx, this.text, this.x, this.y, this.w, this.lineheight);
        }
    };

    TextAsset.prototype.wrapText = function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var lines = text.split("\n"), i, n, words, line, testLine, metrics, testWidth;
        y += this.lineheight;
        for (i = 0; i < lines.length; i++) {

            words = lines[i].split(' ');
            line = '';

            for (n = 0; n < words.length; n++) {
                testLine = line + words[n] + ' ';
                metrics = context.measureText(testLine);
                testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    context.fillText(line, x, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }

            context.fillText(line, x, y);
            y += lineHeight;
        }
    };

    /**
     * This function determines whhether the mouse is hovering a drawn asset.
     * @param mx mouse's x position
     * @param my mouse's y position
     * @returns {boolean} True if the mouse is above the asset, otherwise false
     */
    TextAsset.prototype.contains = function (mx, my) {
        // All we have to do is make sure the Mouse X,Y fall in the area between
        // the shape's X and (X + Height) and its Y and (Y + Height)
        return (this.x <= mx) && (this.x + this.w >= mx) &&
            (this.y <= my) && (this.y + this.getHeight() >= my);
    };

    /**
     * Checks the imagepath to see if the given image belongs to the asset category "Text"
     * @param imagepath imagepath to check
     * @returns {boolean} True if the imagepath belongs to the "Text" category, false otherwise.
     */
    function isTextAsset(imagepath) {
        var textassets, i;
        for (i = 0; i < $scope.assetgroups.length; i++) {
            if ($scope.assetgroups[i].name === "Text") {
                textassets = $scope.assetgroups[i].assets;
                break;
            }
        }

        if (textassets !== null) {
            for (i = 0; i < textassets.length; i++) {
                if ("images/Assets/" + textassets[i].image === imagepath) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Drop an asset on the canvas. This function makes distinction between backgrounds and normal assets.
     * If the dropped asset is a normal asset, the asset gets added to the CanvasState's assets[] array and drawn on the canvas.
     * If the dropped asset is a background, the background property of the canvas is set and the new background path is saved on the server.
     * @param event HTML 5 drop event
     */
    $scope.dropAsset = function (event) {
        event.preventDefault();
        var assetmenu = document.getElementById('assetmenu'),
            editorbar = document.getElementById('editorbar'),
            navbar = document.getElementById('navbar'),
            assetx,
            assety,
            imagepath;

        if (isBackgroundAsset(event.dataTransfer.getData("imagepath"))) {
            imagepath = event.dataTransfer.getData("imagepath");
            sceneService.scene.update({sceneid: $scope.currentscene._id}, {background: imagepath}, function (data) {
                if (editor !== null) {
                    editor.style.backgroundImage = "url('../" + data.doc.background + "')";
                }
                $scope.currentscene.background = imagepath;
                $scope.redrawCanvas();
            }, function (err) {
                window.alert("Failed to update background, please try again.");
                console.log("Error while updating background: " + err);
            });
        } else if (isTextAsset(event.dataTransfer.getData("imagepath"))) {
            if (assetmenu !== null && editorbar !== null) {
                assetx = event.pageX - parseInt(window.getComputedStyle(assetmenu, null).width, 10) - parseInt(window.getComputedStyle(assetmenu, null).paddingLeft, 10) - parseInt(window.getComputedStyle(assetmenu, null).paddingRight, 10);
                assety = event.pageY - parseInt(window.getComputedStyle(editorbar, null).height, 10) - parseInt(window.getComputedStyle(navbar, null).height, 10);
            } else {
                assetx = event.pageX;
                assety = event.pageY;
            }
            canvasstate.addShape(new TextAsset(assetx, assety, 200, canvasstate, "Double click to change this text..", null));
        } else {
            if (assetmenu !== null && editorbar !== null) {
                assetx = event.pageX - parseInt(window.getComputedStyle(assetmenu, null).width, 10) - parseInt(window.getComputedStyle(assetmenu, null).paddingLeft, 10) - parseInt(window.getComputedStyle(assetmenu, null).paddingRight, 10);
                assety = event.pageY - parseInt(window.getComputedStyle(editorbar, null).height, 10) - parseInt(window.getComputedStyle(navbar, null).height, 10);
            } else {
                assetx = event.pageX;
                assety = event.pageY;
            }
            canvasstate.addShape(new Asset(assetx, assety, event.dataTransfer.getData("imagepath"), canvasstate));
            updateServerAssets();
        }

    };

    if (editor !== null && editor !== undefined) {
        editor.addEventListener('dragover', allowDrop);
        editor.addEventListener('drop', $scope.dropAsset);
    }


    //Check if a current story if present, if not -> Redirect the user
    if (currentStoryService.currentstory !== null && currentStoryService.currentstory !== undefined) {
        $scope.story = currentStoryService.currentstory;
    }

    if ($scope.story === null || $scope.story === undefined) {
        window.alert("Geen story geselecteerd");
        $location.path('/stories');
    }


    $scope.showassetproperties = false;
    $scope.selectedAsset = null;

    //Contains the alerts for the flash messages
    $scope.alerts = [
    ];

    /**
     * Adds an alert to the $scope.alerts array, the alert is displayed and removed after a timeout.
     * @param type Valid options - success / error . Success gives a green message, error gives a red message.
     * @param message Message to display in the container.
     */
    $scope.addAlert = function (type, message) {
        $scope.alerts.push({type: type, msg: message});
        setTimeout(function () {
            $scope.closeAlert();
        }, 3000);
    };

    /**
     * Closes the first alert of the alerts array.
     */
    $scope.closeAlert = function () {
        $scope.alerts.splice(0, 1);
        $scope.redrawCanvas();
    };

    /**
     * This function checks whether an asset has an assetoption linking to another scenario. It is used as a
     * check in other functions.
     * @param asset The asset to check.
     * @returns {boolean} True if the asset has a scenariolink option, otherwise false
     */
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

    /**
     * Loops through all a scenario's scene's and their underlying assets.
     * Every asset within every scene is checked for a assetoption that links to a different scenario.
     * If a assetoption is found the involved scenario's will get a new linkfrom/linkto option set.
     * @param index Index of the scenario to check in the $scope.scenarios array
     */
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

    /**
     * Checks all scenario's for assets with links to another scenario. If such an asset is found the scenario will get a new linkto/linkfrom property added.
     */
    function updateAllScenarioLinks() {
        var i;
        for (i = 0; i < $scope.scenarios.length; i++) { //Elk scenario afgaan
            updateSingleScenarioLinks(i);
        }

    }

    /**
     * This function is called when the assetproperties menu appears and the selected asset has a link to another scenario.
     * This function checks the _id property of the link to see which scenario it matches. When the scenario is found, it's name is
     * set as the name of the asset's assetoption object. This is necessary to display the right name in the assetproperties menu.
     */
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

    /**
     * Adds an assetoption to the selected asset after clearing the old assetoption. The assetoption will be a "link to next scene" option.
     * If the asset had a "link to scenario" option, this will be reset and the "linkto" and "linkfrom" blocks in the scenario list will be refreshed.
     */
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

    /**
     * Adds an assetoption to the selected asset after clearing the old assetoption. The assetoption will be a "link to previous scene" option.
     * If the asset had a "link to scenario" option, this will be reset and the "linkto" and "linkfrom" blocks in the scenario list will be refreshed.
     */
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

    /**
     * Adds an assetoption to the selected asset after clearing the old assetoption. The assetoption will be a "link to scenario" option.
     * The _id of the linked scenario will be saved in the asset's assetoption object. After adding the option the linkto" and "linkfrom" blocks in the scenario list will be refreshed. .
     */
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

    /**
     * Saves the mousedown coordinates when clicking on a scene. This is later used to determine whether the user dragged the
     * scene or simply clicked it. When the user hasn't fired the mouseup event yet, it's still safe to assume it's a click action.
     * @param Mousedown event containing the mouse's coordinates
     */
    $scope.onSceneMouseDown = function (event) {
        $scope.scenedragged = false;
        lastscenedragx = event.pageX;
    };

    /**
     * Compares the x-coordinates of the mousedown event with the mouseup event. If there's a difference this means that the
     * user has dragged a scene instead of clicking it. The scenedragged boolean will be set to true.
     * @param event Mouseup event containing the mouse's coordinates
     */
    $scope.onSceneMouseUp = function (event) {
        if (event.pageX < lastscenedragx - 5 || event.pageX > lastscenedragx + 5) {
            $scope.scenedragged = true;
        }
    };

    /**
     * Saves the mousedown coordinates when clicking on a scenario. This is later used to determine whether the user dragged the
     * scenario or simply clicked it. When the user hasn't fired the mouseup event yet, it's still safe to assume it's a click action.
     * @param Mousedown event containing the mouse's coordinates
     */
    $scope.onScenarioMouseDown = function (event) {
        $scope.scenariodragged = false;
        lastscenariodragy = event.pageY;
    };

    /**
     * Compares the y-coordinates of the mousedown event with the mouseup event. If there's a difference this means that the
     * user has dragged a scenario instead of clicking it. The scenariodragged boolean will be set to true.
     * @param event Mouseup event containing the mouse's coordinates
     */
    $scope.onScenarioMouseUp = function (event) {
        if (event.pageY > lastscenariodragy + 5 || event.pageY < lastscenariodragy - 5) {
            $scope.scenariodragged = true;
        }
    };

    /**
     * Creates the first scenario of the story and refreshes the scenario's again with the "firstload" boolean set to true.
     * This function is used when a user opens a new story for the first time.
     */
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

    /**
     * Clears the canvas and loads a specified scene's background and assets.
     * @param index Index of the scene in the $scope.scenes[] array.
     */
    $scope.loadScene = function (index) {
        if (!$scope.scenedragged) {
            console.log("Loading scene: " + index);
            canvasstate.loadScene($scope.scenes[index]);
            if (editor !== null && editor !== undefined) {
                editor.style.backgroundImage = "url('../" + $scope.scenes[index].background + "')";
            }
            $scope.currentSceneindex = index + 1;
        } else {
            $scope.scenedragged = false;
        }

    };

    /**
     * Retrieves the current scenario's scenes from the server and loads them into the application.
     * @param firstload This boolean indicates whether a scenario has just been opened, meaning the first scene should be opened
     * aswell. If this boolean is false then this means that the scenario has been refreshed, but the user should remain in the
     * same scene.
     */
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

    /**
     * Gets all the scenario's of the current story from the server and refreshes the scenario-list.
     * @param openstory Boolean indicating whether the story has just been opened. If this is the case, the first scenario and
     * first scene should be opened. If false, the list has simply been refreshed, the user wants to stay in the same scenario and scene.
     * @param callback optional, callback function to call after refreshing the scenarios
     */
    refreshScenarios = function (openstory, callback) {
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
            if (callback !== undefined && callback !== null) {
                callback();
            }
        }, function (err) {
            $scope.addAlert("error", "Error while retrieving scenarios, please refresh");
            console.log(err);
        });
    };

    refreshScenarios(true);

    /**
     * If the scenario has been clicked instead of dragged, this function will open the given scenario.
     * The currentscenario will be set and the scenario's scene's will be loaded. The first scene of the scenario will
     * be opened.
     * @param index Index of the scenario to open in the $scope.scenarios[] array.
     */
    $scope.openScenario = function (index) {
        if (!$scope.scenariodragged) {
            $scope.currentscenario = $scope.scenarios[index];
            loadScenes(true);
        } else {
            $scope.scenariodragged = false;
        }
    };

    /**
     * Removes the $scope.selectedAsset from the canvasState's array of assets to draw.
     * If the removed asset had a link to another scenario, the scenariolinks in the scenario list will be refreshed.
     * After removing the asset from the canvas the server will be informed of the deletion.
     */
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

    /**
     * Checks whether or not the "enter" key has been pressed when editing a asset property.
     * If the enter key has been pressed the canvas will be redrawn.
     * @param key keycode of the pressed key.
     */
    $scope.onAssetKeyUp = function (key) {
        if (key === 13) {
            $scope.redrawCanvas();
        }
    };

    $scope.onTextAssetKeyUp = function (key) {
        if (key === 27) {
            $scope.showtextassetedit = false;
            updateTextAsset();
            $scope.redrawCanvas();
        }
    };

    /**
     * Redraws all the assets on the canvas and if necessary the assetproperties menu gets re-positioned.
     */
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

    /**
     * Show a popup where the user can delete a story or modify it's name.
     */
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

    /**
     * Show a popup where the user can modify a scenario's name.
     * If the scenario name is updated, the scenariolist gets refreshed.
     * @param index Index in the $scope.scenarios array of the selected scenario.
     */
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

    /**
     * This function is called when the scenariodropdown button is clicked.
     * This function checks whether the scenario dropdown is about to be displayed or hidden and sets the color
     * of the scenariodropdown button to match either the dropdon or the menubar.
     * @param id id of the element to change.
     * @param currentlyvisible Boolean indicating whether the dropdown is visible at the time of clicking.
     */
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

    /**
     * JSON array containing the possible assets.
     */
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
            name: "Text",
            assets : [
                {
                    "name": "Text",
                    "description": "Editable text",
                    "image": "texticon.png"
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

    /**
     * Adds a scene to the end of the scenelist. The scene is first saved to the server,
     * If the scene has successfully been saved on the server the list of scenes gets refreshed.
     */
    $scope.addScene = function () {
        scenesService.scenes.save({scenarioid: $scope.currentscenario._id}, {}, function () {
            refreshScenarios(false, loadScenes);
            $scope.addAlert("success", "Scene added");
        }, function (err) {
            $scope.addAlert("error", "Error while adding scene");
            console.log(err);
        });
    };

    /**
     * Function for adding a scene on a specified index. The scene is first saved to the server.
     * After saving the scene, the scenario's scene-order array gets updated and sent to the server.
     * After updating the scene-order the scenelist gets refreshed.
     * @param index Index indicating where the new scene should be added.
     */
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

    /**
     * Shows a popup asking verification for deleting a scene. If verification is given the scene will first be checked for
     * links to other scenario's. If the scene had a link to another scenario, the scenariolist's links will be updated.
     * After checking for scenario links the scene gets deleted on the server, afterwards the scenes are refreshed on
     * the clientside.
     * If the scene being deleted is the last scene of the scenario, the delete attempt will be refused.
     */
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

    /**
     * Shows a popup asking verification for removing a scenario.
     * If the user chooses to delete the scenario, the scenario is first deleted on the server, after that the scenario
     * list will be refreshed. If the user changes his mind, the scenario will be added back to the array of scenarios
     * and the scenariolist will be refreshed.
     */
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

    /**
     * Shows a popup where the user can choose to make a new scenario.
     * If the fills in a name and then chooses to save the new scenario, it will first be saved to the server. After
     * saving the scenario on the server the scenariolist will be refreshed.
     */
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

    /**
     * This function is a reusable piece of code that makes sure that your actions to the scoped are applied only
     * when possible. This function serves to prevent a "$scope.digest is already in progress!" error.
     * @param fn The function to execute when possible.
     */
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
    /**
     * Constructor for a selection box, these boxes get added to the selected asset.
     * @param x x position of the selection box.
     * @param y y position of the selection box.
     * @param state reference to the canvas state.
     * @constructor
     */
    function SelectionBox(x, y, state) {
        this.state = state;
        this.x = x || 0;
        this.y = y || 0;
    }

    /**
     * Draw's the asset's image to the canvas. This draw function uses the properties of the Asset to determine
     * position, size, image etc.
     * If the Asset is the currently selected asset, the selection boxes and an outline will be drawn.
     * @param ctx Context to draw the asset on, this is the canvas.
     */
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

    /**r
     * This function determines whhether the mouse is hovering a drawn asset.
     * @param mx mouse's x position
     * @param my mouse's y position
     * @returns {boolean} True if the mouse is above the asset, otherwise false
     */
    Asset.prototype.contains = function (mx, my) {
        // All we have to do is make sure the Mouse X,Y fall in the area between
        // the shape's X and (X + Height) and its Y and (Y + Height)
        return (this.x <= mx) && (this.x + this.w >= mx) &&
            (this.y <= my) && (this.y + this.h >= my);
    };

    /**
     * This is the state that contains all the Assets on the canvas and is responsible for managing everything that happens on the canvas.
     * The canvasstate contains all the assets and functions for adding, drawing, removing, dragging and resizing assets.
     * @param canvas Canvas where the assets will be drawn on.
     * @constructor
     */
    function CanvasState(canvas) {
        // **** First some setup! ****
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.font = '20px Calibri';
        this.ctx.fillStyle = '#333';
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
        if (assetmenu !== null && assetmenu !== undefined) {
            this.assetpropertiesxoffset = parseInt(window.getComputedStyle(assetmenu).width, 0) + parseInt(window.getComputedStyle(assetmenu).paddingLeft, 0) + parseInt(window.getComputedStyle(assetmenu).paddingRight, 0);
        }
        if (document.getElementById('navbar') !== null) {
            this.assetpropertiesyoffset = parseInt(window.getComputedStyle(document.getElementById('navbar')).height, 0) + parseInt(window.getComputedStyle(document.getElementById('editorbar')).height, 0);
        }
        this.assetpropertiesmenuwidth = 260;
        this.assetpropertiesmenuheight = 335;
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
        this.xratio = canvas.width / parseInt(window.getComputedStyle(document.getElementById("editor"), null).width);
        this.yratio = canvas.height / parseInt(window.getComputedStyle(document.getElementById("editor"), null).height);
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

        /**
         * This function checks whether the user has currently selected an asset. If an asset has been selected it will
         * position the asset's properties menu next to it.
         */
        CanvasState.prototype.positionAssetPropertiesMenu = function () {
            var selection = myState.selection, assetpropertiesxoffset, assetpropertiesyoffset, assetpropertiesmenu, canvaswidth;
            if (selection !== null) {
                assetpropertiesxoffset = myState.assetpropertiesxoffset;
                assetpropertiesyoffset = myState.assetpropertiesyoffset;
                assetpropertiesmenu = myState.assetpropertiesmenu;
                canvaswidth = myState.canvas.width;

                //X offset
                if (((selection.x + selection.w) / this.xratio) < parseInt(window.getComputedStyle(this.canvas,null).width) - this.assetpropertiesmenuwidth) {  //Past rechts
                    assetpropertiesmenu.style.left = (selection.x / this.xratio) + assetpropertiesxoffset + (selection.w / this.xratio) + 2 + "px";
                } else if (((selection.x + selection.w) / this.xratio) > parseInt(window.getComputedStyle(this.canvas,null).width) - this.assetpropertiesmenuwidth && (selection.x / this.xratio) > this.assetpropertiesmenuwidth) { //Past niet rechts maar heeft nog wel ruimte links
                    assetpropertiesmenu.style.left = assetpropertiesxoffset + (selection.x / this.xratio) - this.assetpropertiesmenuwidth - 2 + "px";
                } else { //Past niet links, past niet rechts
                    assetpropertiesmenu.style.left = assetpropertiesxoffset + "px";
                }

                //Y offset
                if (selection.y < 0) {
                    assetpropertiesmenu.style.top = assetpropertiesyoffset + "px";
                } else if ((selection.y / this.yratio) > parseInt(window.getComputedStyle(this.canvas, null).height, 10) - this.assetpropertiesmenuheight) { //Gedeelte zou de scenes overlappen
                    assetpropertiesmenu.style.top = assetpropertiesyoffset + parseInt(window.getComputedStyle(this.canvas, null).height, 10) - this.assetpropertiesmenuheight + "px";
                } else {
                    assetpropertiesmenu.style.top = (selection.y / this.yratio) + assetpropertiesyoffset + "px";
                }
            }

        };

        CanvasState.prototype.positionEditText = function (selection) {
            var edittext = document.getElementById("textassettextarea"),
            xoffset = myState.assetpropertiesxoffset,
            yoffset = myState.assetpropertiesyoffset;
            edittext.style.fontSize = Math.round(20 / ((myState.xratio + myState.yratio) / 2)) + "px";
            edittext.style.lineHeight = Math.round(25 / ((myState.xratio + myState.yratio) / 2)) + "px";
            edittext.style.left = (selection.x / myState.xratio) + xoffset - 2 + "px";
            edittext.style.top = (selection.y / myState.yratio) + yoffset + 2 + "px";
            edittext.style.width = (selection.w / myState.xratio) + "px";
            edittext.style.minheight = (selection.getHeight() / myState.yratio)  + "px";
        };

        // Up, down, and move are for dragging
        canvas.addEventListener('mousedown', function (e) {
            if ($scope.showtextassetedit) {
                updateTextAsset();
            }

            var mouse = myState.getMouse(e),
                mx = mouse.x * myState.xratio,
                my = mouse.y * myState.yratio,
                shapes = myState.shapes,
                l = shapes.length,
                index,
                mySel,
                selectasset;

            if (myState.expectResize !== -1) { // Mouse is above one of the resize-boxes. If a user clicks this means that he is dragging a resize-box.
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

            //Check if we've selected an asset
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
                mx = mouse.x * myState.xratio,
                my = mouse.y * myState.yratio,
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

            //If we're hovering a resize-box, set the cursor to match your action.
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
                this.style.cursor = 'auto'; //Don't forget to reset the cursor to normal.
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
                $scope.safeApply(function () { //After dragging we want to show the asset properties again
                    myState.positionAssetPropertiesMenu();
                    $scope.showassetproperties = true;
                    updateServerAssets();
                });
            }
        }, true);


        canvas.addEventListener('dblclick', function (e) {
            var mouse = myState.getMouse(e),
                mx = mouse.x * myState.xratio,
                my = mouse.y * myState.yratio,
                shapes = myState.shapes,
                l = shapes.length,
                index,
                mySel,
                selectasset;

            for (index = l - 1; index >= 0; index--) {
                mySel = shapes[index];
                if (shapes[index].contains(mx, my)) {
                    if (shapes[index] instanceof TextAsset) {
                        $scope.safeApply(function () {
                            var edittext = document.getElementById("textassettextarea"),
                                selection = myState.selection,
                                xoffset,
                                yoffset;


                            if (selection !== null) {
                                myState.positionEditText(selection);
                                var newtext = selection.text;
                                newtext = newtext.replace(/\n/g, '<br />');
                                edittext.innerHTML = newtext;
                                $scope.showtextassetedit = true;
                                $scope.showassetproperties = false;
                                myState.valid = false;
                            }

                        });
                    }
                    return;
                }
            }
        }, true);

        // **** Options! ****

        this.selectionColor = '#CC0000';
        this.selectionWidth = 2;
        this.selectionboxsize = 6;
        this.interval = 30; //Interval for redrawing while dragging. 1000/30 = 33fps.
        setInterval(function () {
            myState.draw();
        }, myState.interval);
    }

    /**
     * Loads a given scene by clearing the canvas, setting the right background and drawing all the scene's assets
     * on the canvas.
     * @param scene Scene-object to open, must contain at least the background and the asset-array.
     */
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
                    if(assets[i].text === undefined || assets[i].text === null){
                        canvasstate.addShape(new Asset(assets[i].x, assets[i].y, assets[i].imagepath, canvasstate, assets[i].width, assets[i].height, assets[i].assetoption));
                    } else {
                        canvasstate.addShape(new TextAsset(assets[i].x, assets[i].y, assets[i].width, canvasstate, assets[i].text, assets[i].assetoption));
                    }
                }
            }
        } else {
            console.log("Cannot change scene -> Currently saving scene");
        }
    };

    /**
     * Removes a given asset from the canvas and redraws the canvas.
     * @param shape Asset to remove
     */
    CanvasState.prototype.removeAsset = function (shape) {
        this.shapes.splice(this.shapes.indexOf(shape), 1);
        this.valid = false;
        $scope.safeApply(function () {
            $scope.showassetproperties = false;
            $scope.selectedAsset = null;
        });
        this.draw();
    };

    /**
     * Adds an asset to the canvas, set's the canvas state to invalid so it gets redrawn with the new asset.
     * @param shape
     */
    CanvasState.prototype.addShape = function (shape) {
        this.shapes.push(shape);
        this.valid = false;
    };

    /**
     * Clears the entire canvas. Constantly used when redrawing.
     */
    CanvasState.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    /**
     * Checks whether the canvas' state has been set to invalid, meaning something new happened. If this is the case
     * the entire canvas gets cleared and then redrawn.
     */
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

            // draw all assets
            l = shapes.length;
            for (i = 0; i < l; i++) {
                shape = shapes[i];
                outofcanvas = false;
                // We can skip the drawing of elements that have moved off the screen:
                if (shape.x > this.canvas.width || shape.y > this.canvas.height ||
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

    /**
     * Calculates the correct x and y position of the mouse when a user clicks and returns this in an object.
     * @param e Mousedown event
     * @returns {{x: number, y: number}} x and y position of the mouse.
     */
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

    /**
     * When the window resizes, the width and height properties of the canvas need to be set aswell.
     */
    window.addEventListener('resize', function () {
        var canvas = document.getElementById('editor');
        if (canvas !== null && canvas !== undefined) {
          //  canvas.setAttribute('width',  parseInt(window.getComputedStyle(canvas, null).width, 10).toString());
           // canvas.setAttribute('height', parseInt(window.getComputedStyle(canvas, null).height, 10).toString());
            canvasstate.xratio = canvas.width / parseInt(window.getComputedStyle(document.getElementById("editor"), null).width);
            canvasstate.yratio = canvas.height / parseInt(window.getComputedStyle(document.getElementById("editor"), null).height);
            canvasstate.valid = false;
            canvasstate.positionAssetPropertiesMenu();
            canvasstate.draw();
        }
    });

    /**
     * Called at the start of the application. A new canvas state object is made and the height and width properties
     * of the canvas are set. This canvasstate will be used for future reference.
     */
    function initCanvas() {
        var canvas = document.getElementById(('editor')), testcanvas;
        if (canvas !== null) {
            //canvas.setAttribute('width',  parseInt(window.getComputedStyle(canvas, null).width, 10).toString());
            //canvas.setAttribute('height', parseInt(window.getComputedStyle(canvas, null).height, 10).toString());
        }
        if (canvas === null) {
            testcanvas = document.createElement('canvas');
            canvasstate = new CanvasState(testcanvas);
        } else {
            canvasstate = new CanvasState(canvas);
        }
    }

    /**
     * When a user drops an asset on the canvas, the canvas needs to know which asset has been dropped. This function
     * adds the source of the image to the event for future reference.
     * @param event HTML5 dragstart event, set from the directive
     */
    $scope.dragAsset = function (event) {
        event.dataTransfer.setData("imagepath", event.target.getAttribute('src'));
    };

    initCanvas();

    //Sortable
    $scope.deleteList = [];

    /**
     * Defines a function to be called when a scene is dropped into the trash.
     */
    $scope.sortableOptionsTrash = {
        receive: function () {
            $scope.deleteScene();
        }
    };

    /**
     * Defines a function to be called when a scenario is dropped into the trash.
     */
    $scope.sortableOptionsTrashScenarios = {
        receive: function () {
            deleteDraggedScenario();
        }
    };

    /**
     * Options for a sortable scene, defines functions to be called when a user updates a scene's position, when a
     * user removes the scenes from the array (deletes it) and when a user stops dragging.
     */
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

    /**
     * Options for a sortable scene, defines functions to be called when a user updates a scene's position, when a
     * user removes the scenes from the array (deletes it) and when a user stops dragging.
     */
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

    $scope.getCanvasstate = function () {
        return canvasstate;
    };


}]);
