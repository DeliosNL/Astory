aStory.controller('editScenarioController', ['$scope', 'scenario', '$modalInstance', 'scenarioService', function ($scope, scenario, $modalInstance, scenarioService) {
    $scope.scenario = scenario;
    $scope.newdata = {
        name: $scope.scenario.title
    };

    $scope.close = function () {
        $modalInstance.close(false);
    };

    $scope.saveScenario = function () {
        scenarioService.scenario.update({scenarioid : scenario._id}, {name: $scope.newdata.name}, function(data) {
            $modalInstance.close(true);
        }, function (err) {
           alert("Error while updating scenario, please try again");
        });
        /*
        scenario.title = $scope.newdata.name;
        $modalInstance.close();
        */
    };

}]);

aStory.controller('editorController', ['$scope', '$modal', 'storiesService', '$location', 'currentStoryService', 'scenariosService', 'scenesService', 'sceneService', 'scenarioService', function ($scope, $modal, storiesService, $location, currentStoryService, scenariosService, scenesService, sceneService, scenarioService) {
    //ALERTS

    $scope.alerts = [
    ];

    $scope.addAlert = function(type, message) {
        $scope.alerts.push({type: type, msg: message});
        setTimeout(function() {
            $scope.closeAlert();
        }, 3000);
    };

    $scope.closeAlert = function() {
        $scope.alerts.splice(0, 1);
        $scope.redrawCanvas();
    };





    var savingscene = false;
    $scope.story = currentStoryService.currentstory;
    if ($scope.story == null) {
        alert("Geen story geselecteerd");
        $location.path('/stories');
    }

    $scope.showassetproperties = false;
    $scope.selectedAsset = null;

    function makeFirstScenario() {
        "use strict";
        scenariosService.scenarios.save({storyid: $scope.story._id}, {name: "My first scenario"}, function(data) {
            storiesService.stories.get(function(data) {
                for(var i = 0; i < data.doc.length; i++){
                    if(data.doc[i]._id === $scope.story._id){
                        $scope.story.scenarioorder = data.doc[i].scenarioorder;
                        break;
                    }
                }
                refreshScenarios(true);
            }, function ( err) {
                alert("Failed to refresh scenarios");
            });
        }, function (error) {
            alert("Error while adding scenario, please try again.");
        });
    }

    $scope.loadScene = function(index) {
        console.log("Loading scene: " + index);
        canvasstate.loadScene($scope.scenes[index]);
        $scope.currentSceneindex = index + 1;
    }


    function loadScenes(firstload) {
        scenesService.scenes.get({scenarioid: $scope.currentscenario._id}, function(data) {
            if (data.doc.length === 0) {
                scenesService.scenes.save({scenarioid: $scope.currentscenario._id}, {}, function(data) {
                    refreshScenarios(true);
                    return 0;
                }, function (err) {
                    alert("Error while adding scene");
                });
            } else {
                $scope.scenes = [];
                for(var i = 0; i < $scope.currentscenario.sceneorder.length; i++){
                    for(var b = 0; b < data.doc.length; b++){
                        if($scope.currentscenario.sceneorder[i] === data.doc[b]._id) {
                            $scope.scenes.push(data.doc[b]);
                            break;
                        }
                    }
                }
                //$scope.scenes = data.doc;
                if(firstload) {
                    $scope.currentscene = $scope.scenes[0];
                    $scope.loadScene(0);
                }
            }
        }, function(err) {
            alert("Failed to get scenes");
        });
    }

    function refreshScenarios(firstrefresh) {
        "use strict";
        scenariosService.scenarios.get({storyid: $scope.story._id}, function (data) {
            if(data.doc.length === 0) {
                makeFirstScenario();
                return 0;
            }

            $scope.scenarios = [];
            for(var i = 0; i < $scope.story.scenarioorder.length; i++){
                for(var b = 0; b < data.doc.length; b++){
                    if(data.doc[b]._id === $scope.story.scenarioorder[i]){
                        $scope.scenarios.push(data.doc[b]);
                        break;
                    }
                }
            }

            if(firstrefresh) {

                $scope.currentscenario = $scope.scenarios[0];
                loadScenes(true);
            } else {
                for(var i = 0; i < $scope.scenarios.length; i++){
                    if($scope.scenarios[i]._id === $scope.currentscenario._id){
                        $scope.currentscenario = $scope.scenarios[i]; //De naam is geupdate, currentscenario moet opnieuw gezet worden.
                    }
                }
            }
        }, function (err) {
            alert("Error while retrieving scenarios, please refresh.");
        });
    }
    refreshScenarios(true);


    $scope.openScenario = function (index) {
        $scope.currentscenario = $scope.scenarios[index];
        loadScenes(true);
    };

    $scope.removeSelectedAsset = function () {
        canvasstate.removeAsset($scope.selectedAsset);
        updateServerAssets();
    };

    $scope.onAssetKeyUp = function (key) {
        if(key == 13){
            $scope.redrawCanvas();
        }
    };

    $scope.redrawCanvas = function () {
        $scope.safeApply(function () {
            if ($scope.selectedAsset !== null) {
                $scope.selectedAsset.h = parseInt($scope.selectedAsset.h);
                $scope.selectedAsset.w = parseInt($scope.selectedAsset.w);
                $scope.selectedAsset.x = parseInt($scope.selectedAsset.x);
                $scope.selectedAsset.y = parseInt($scope.selectedAsset.y);
            }
            canvasstate.positionAssetPropertiesMenu();
            canvasstate.valid = false;
            canvasstate.draw();
        });
    };

    $scope.showStoryPopup = function (index) {
        var modalInstance = $modal.open({
            templateUrl: '../partials/storypopup.html',
            controller: 'storypopupController',
            resolve: {
            }
        });

        modalInstance.result.then(function (action, test) {
            if(action === "updated"){

            } else if(action === "deleted") {
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
            if(updated) {
                refreshScenarios();
            }
        });
    };

    $scope.setEditorbarDropdownColor = function (id, currentlyvisible) {
        if (currentlyvisible) { //Will be invisible soon
            document.getElementById(id).style.backgroundColor = document.getElementById('editorbar').style.backgroundColor;
        } else { //Will become visible soon
            var editorbarbuttons = document.getElementsByClassName('editorbarbutton');
            for (var i = 0; i < editorbarbuttons.length; i++) {
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
                    "name": "Achtergrond1A",
                    "description": "Sneeuwbergen achtergrond",
                    "image": "Achtergrond1A.png"
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
                    "name": "Achtergrond1B",
                    "description": "Sneeuwbergen achtergrond geen sneeuw",
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
                    "image": "Gingerbread huis.png"
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
        scenesService.scenes.save({scenarioid: $scope.currentscenario._id}, {}, function(data) {
            refreshScenarios(false);
            loadScenes();
        }, function (err) {
            alert("Error while adding scene");
        });
    };

    $scope.addScenarioEvent = function (index) {
        $scope.safeApply(function () {
            $scope.addAlert("success", "Scenario: " + $scope.scenarios[index].name + " is toegevoegd als assetoptie!");
            $scope.showassetproperties = false;
        });
    };

    $scope.addSceneByIndex = function (index) {
        $scope.scenes.splice(index, 0, {
            "image": "johndoe.png"
        });
    };

    $scope.deleteScene = function () {
        var modalInstance = $modal.open({
            templateUrl: '../partials/confirmdeletepopup.html',
            controller: 'confirmdeletepopupcontroller',
            resolve: {
                itemlist: function () {
                    return $scope.scenes;
                },
                itemtype: function () {
                    return "scene";
                },
                item: function () {
                    return $scope.scenes[0];
                },
                popupabove: function () {
                    return null;
                },
                name: function () {
                    return "Scene " + 1;
                }
            }
        });
    };

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

        scenariopopup.result.then(function(updated){
            if(updated){
                storiesService.stories.get(function(data) {
                    for(var i = 0; i < data.doc.length; i++){
                        if(data.doc[i]._id === $scope.story._id){
                            $scope.story.scenarioorder = data.doc[i].scenarioorder;
                            break;
                        }
                    }
                    refreshScenarios();
                }, function ( err) {
                    alert("Failed to refresh scenarios");
                });

            }
        });
    };


    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    /* Drag and drop zooi */
    function updateServerAssets() {
        if(!savingscene) {
            savingscene = true;
            var newshapes = [];
            for(var i = 0; i < canvasstate.shapes.length; i++){
                var shape = canvasstate.shapes[i];
                var newshape = {
                    x: shape.x,
                    y: shape.y,
                    width: shape.w,
                    height: shape.h,
                    assetoption: shape.assetoption,
                    imagepath: shape.imgNew.src
                }
                newshapes.push(newshape);
            }
            sceneService.scene.update({sceneid: $scope.currentscene._id}, {assets: newshapes}, function(data) {
                $scope.currentscene.assets = newshapes;
                savingscene = false;
            }, function(err) {
                savingscene = false;
                console.log("Error while saving assets");
            });
        }

    }


    function SelectionBox(x, y, state) {
        "use strict";
        this.state = state;
        this.x = x || 0;
        this.y = y || 0;
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

        this.imgNew.onload = onImageLoad;

        function onImageLoad() {
            if(w === undefined || h === undefined) {
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
    }

    // Draws this shape to a given context
    Asset.prototype.draw = function (ctx) {
        var i, cur, half;
        var locx = this.x;
        var locy = this.y;

        if (this.state.selection == this) {
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
        return  (this.x <= mx) && (this.x + this.w >= mx) &&
            (this.y <= my) && (this.y + this.h >= my);
    };

    function CanvasState(canvas) {
        // **** First some setup! ****
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        // This complicates things a little but but fixes mouse co-ordinate problems
        // when there's a border or padding. See getMouse for more detail
        var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
        if (document.defaultView && document.defaultView.getComputedStyle) {
            this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10) || 0;
            this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10) || 0;
            this.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
            this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10) || 0;
        }

        var html = document.body.parentNode;
        this.htmlTop = html.offsetTop;
        this.htmlLeft = html.offsetLeft;

        var assetmenu = document.getElementById('assetmenu');
        this.assetpropertiesxoffset = parseInt(window.getComputedStyle(assetmenu).width, 0) + parseInt(window.getComputedStyle(assetmenu).paddingLeft, 0) + parseInt(window.getComputedStyle(assetmenu).paddingRight, 0);
        this.assetpropertiesyoffset = parseInt(window.getComputedStyle(document.getElementById('navbar')).height, 0) + parseInt(window.getComputedStyle(document.getElementById('editorbar')).height, 0);
        this.assetpropertiesmenuwidth = 234;
        this.assetpropertiesmenuheight = 445;
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

        var myState = this;

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
            var selection = myState.selection;
            var assetpropertiesxoffset = myState.assetpropertiesxoffset;
            var assetpropertiesyoffset = myState.assetpropertiesyoffset;
            var assetpropertiesmenu = myState.assetpropertiesmenu

            //X offset
            if(selection.x > parseInt(window.getComputedStyle(this.canvas, null).width) - selection.w - this.assetpropertiesmenuwidth){
                assetpropertiesmenu.style.left = assetpropertiesxoffset + selection.x - this.assetpropertiesmenuwidth + "px";
            } else {
                assetpropertiesmenu.style.left = selection.x + assetpropertiesxoffset + selection.w + "px";
            }

            //Y offset
            if(selection.y < 0){
                assetpropertiesmenu.style.top = assetpropertiesyoffset + "px";
            } else if ( selection.y > parseInt(window.getComputedStyle(this.canvas, null).height) - this.assetpropertiesmenuheight){
                assetpropertiesmenu.style.top = assetpropertiesyoffset + parseInt(window.getComputedStyle(this.canvas, null).height) - this.assetpropertiesmenuheight + "px";
            } else {
                assetpropertiesmenu.style.top = selection.y + assetpropertiesyoffset + "px";
            }
        };

        // Up, down, and move are for dragging
        canvas.addEventListener('mousedown', function (e) {

            var mouse = myState.getMouse(e);
            var mx = mouse.x;
            var my = mouse.y;
            var shapes = myState.shapes;
            var l = shapes.length;

            if (myState.expectResize !== -1) {
                myState.resizeDragging = true;
                return;
            }

            for (var i = l - 1; i >= 0; i--) {
                var mySel = shapes[i];
                myState.dragoffx = mx - mySel.x;
                myState.dragoffy = my - mySel.y;
                myState.dragging = true;
                myState.selection = mySel;
                myState.valid = false;
                if (shapes[i].contains(mx, my)) {
                    $scope.safeApply(function () {
                        myState.positionAssetPropertiesMenu();
                        $scope.selectedAsset = shapes[i];
                        $scope.showassetproperties = true;
                    });

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
                oldx, oldy, i, cur;
            if (myState.dragging) {
                $scope.safeApply(function () {
                    $scope.showassetproperties = false;
                })
                // We don't want to drag the object by its top-left corner, we want to drag it
                // from where we clicked. Thats why we saved the offset and use it here
                myState.selection.x = mx - myState.dragoffx;
                myState.selection.y = my - myState.dragoffy;
                myState.valid = false; // Something's dragging so we must redraw
            } else if (myState.resizeDragging) {
                $scope.safeApply(function () {
                    $scope.showassetproperties = false;
                })
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
                for (i = 0; i < 8; i += 1) {
                    cur = myState.selectionHandles[i];
                    if (mx >= cur.x && mx <= cur.x + myState.selectionboxsize &&
                        my >= cur.y && my <= cur.y + myState.selectionboxsize) {
                        myState.expectResize = i;
                        myState.valid = false;

                        switch (i) {
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

        canvas.addEventListener('mouseup', function (e) {
            myState.dragging = false;
            myState.resizeDragging = false;
            myState.expectResize = -1;
            if (myState.selection != null) {
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
            var mouse = myState.getMouse(e);
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

    CanvasState.prototype.loadScene = function(scene) {
        if(!savingscene) {
            $scope.currentscene = scene;
            $scope.showassetproperties = false;
            this.shapes = [];
            this.clear();
            var assets = scene.assets;
            if(assets !== undefined && assets !== null) {
                for(var i = 0; i < assets.length; i++){
                    canvasstate.addShape(new Asset(assets[i].x, assets[i].y, assets[i].imagepath, canvasstate, assets[i].width, assets[i].height, assets[i].assetoption));
                }
            }
        } else {
            console.log("Cannot change scene -> Currently saving scene");
        }
    };

    CanvasState.prototype.removeAsset = function(shape){
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
        this.ctx.clearRect(0, 0, parseInt(window.getComputedStyle(this.canvas).width), parseInt(window.getComputedStyle(this.canvas).height));
    };

    CanvasState.prototype.draw = function () {
        // if our state is invalid, redraw and validate!
        if (!this.valid) {
            var ctx = this.ctx;
            var shapes = this.shapes;
            this.clear();

            // ** Add stuff you want drawn in the background all the time here **

            // draw all shapes
            var l = shapes.length;
            for (var i = 0; i < l; i++) {
                var shape = shapes[i];
                // We can skip the drawing of elements that have moved off the screen:
                if (shape.x > parseInt(window.getComputedStyle(this.canvas).width) || shape.y > parseInt(window.getComputedStyle(this.canvas).height) ||
                    shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
                shapes[i].draw(ctx);
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
            } while ((element = element.offsetParent));
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

    var pos;
    var canvasstate;

    $scope.get_pos = function (ev) {
        pos = [ev.pageX, ev.pageY];
    };

    window.addEventListener('resize', function () {
        var canvas = document.getElementById('editor');
        if (canvas !== null && canvas !== undefined) {
            canvas.setAttribute('width', window.getComputedStyle(canvas).width);
            canvas.setAttribute('height', window.getComputedStyle(canvas).height);
            canvasstate.valid = false;
            canvasstate.draw();
        }
    });

    function initCanvas() {
        var canvas = document.getElementById(('editor'));
        canvas.setAttribute('width', window.getComputedStyle(canvas).width);
        canvas.setAttribute('height', window.getComputedStyle(canvas).height);
        canvasstate = new CanvasState(canvas);
    }

    function allowDrop(event) {
        event.preventDefault();
    }

    function dropAsset(event) {
        event.preventDefault();
        var assetmenu = document.getElementById('assetmenu');
        var editorbar = document.getElementById('editorbar');
        var navbar = document.getElementById('navbar');

        //var dx = pos[0] - img.offsetLeft;
        //var dy = pos[1] - img.offsetTop;
        var assetx = event.pageX - parseInt(window.getComputedStyle(assetmenu).width) - parseInt(window.getComputedStyle(assetmenu).paddingLeft) - parseInt(window.getComputedStyle(assetmenu).paddingRight);
        var assety = event.pageY - parseInt(window.getComputedStyle(editorbar).height) - parseInt(window.getComputedStyle(navbar).height);
        canvasstate.addShape(new Asset(assetx, assety, event.dataTransfer.getData("imagepath"), canvasstate));
        updateServerAssets();
    }

    $scope.dragAsset = function (event) {
        event.dataTransfer.setData("imagepath", event.target.getAttribute('src'));
    };

    var editor = document.getElementById('editor');
    editor.addEventListener('dragover', allowDrop);
    editor.addEventListener('drop', dropAsset);

    initCanvas();

    //Sortable
    $scope.sortableOptions = {
        update: function(e, ui) {
        },
        stop: function(e, ui) {
            var sceneorderlocal = [];
            for(var i = 0 ; i < $scope.scenes.length; i++){
                sceneorderlocal.push($scope.scenes[i]._id);
            }
            scenarioService.scenario.update({scenarioid : $scope.currentscenario._id}, {sceneorder: sceneorderlocal}, function(data) {
            }, function (err) {
                alert("Error while updating scene order, your progress might not have been saved.");
            })
            //alert('lel stop');
        }
    }

    $scope.sortableOptionsScenario = {
        update: function(e, ui) {
            //alert('kankeururur');
        },
        stop: function(e, ui) {
            var scenarioorderlocal = [];
            for(var i = 0; i < $scope.scenarios.length; i++){
                scenarioorderlocal.push($scope.scenarios[i]._id);
            }
            storiesService.stories.update({_id: $scope.story._id}, {scenarioorder: scenarioorderlocal}, function(data) {

            }, function(error) {
                alert("Failed to update scenario order on server");
            });
            //alert('lel stop');
        }
    }
}]);

