/*jslint  nomen: true, node: true, plusplus: true, browser: true, todo: true */
/*globals aStory, window, document,*/
aStory.controller('playerController', ['$scope', '$location', '$routeParams', 'currentStoryService', 'storiesService', 'scenarioService', 'scenesService', function ($scope, $location, $routeParams, currentStoryService, storiesService, scenarioService, scenesService) {
    $scope.ispreview = false;
    $scope.currentstory = null;
    $scope.currentscenario = null;
    $scope.currentscene = null;
    $scope.scenes = null;
    var canvasstate, player = document.getElementById('preview');
    $scope.ispreview = ($location.path().indexOf("/preview") !== -1);

    function getStoryFromServer(id, callback) {
        storiesService.stories.get({_id: id}, function (data) {
            if (data.err === null) {
                $scope.currentstory = data.doc;
                if (callback) {
                    callback();
                }
            } else {
                window.alert("Error: Cannot retrieve this story");
                $location.path('/');
            }
        }, function (err) {
            window.alert("Error while retrieving story, please try again.");
        });
    }

    function openScenario(id, callback) {
        scenarioService.scenario.get({scenarioid: id}, function (data) {
            if (data.err === null) {
                $scope.currentscenario = data.doc;
                if (callback) {
                    callback();
                }
            } else {
                window.alert("ERROR: Scenario does not exist(probably)");
            }
        }, function (err) {
            window.alert("Failed to open scenario");
        });
    }

    function loadScenarioScenes(id, callback) {
        scenesService.scenes.get({scenarioid: id}, function (data) {
            if (data.err === null) {
                $scope.scenes = data.doc;
                if (callback) {
                    callback();
                }
            } else {
                window.alert("ERROR: Scenario has no scenes(Probably?)");
            }
        }, function (err) {
            window.alert("Failed to get scenes from server");
        });
    }

    function loadScene(index) {
        console.log("Loading scene: " + index);
        canvasstate.loadScene($scope.scenes[index]);
        if (player !== null && player !== undefined) {
            player.style.backgroundImage = "url('../" + $scope.scenes[index].background + "')";
        }
    }

    function openFirstScene() {
        openScenario($scope.currentstory.scenarioorder[0], function () {
            loadScenarioScenes($scope.currentscenario._id, function () {
                //Eerste scenario + bijbehorende scenes zijn succesvol opgehaald. Zet de eerste scene in beeld
                for (var i = 0; i < $scope.scenes.length; i++ ) {
                    if($scope.scenes[i]._id === $scope.currentscenario.sceneorder[0]){
                        $scope.currentscene = $scope.scenes[i];
                        loadScene(i);
                        break;
                    }
                }
            });
        });
    }

    function openStory() {
        if ($scope.ispreview) {
            if (currentStoryService.currentstory === undefined || currentStoryService.currentstory === null) {
                window.alert("No story selected!");
                $location.path('/stories');
            } else {
                getStoryFromServer(currentStoryService.currentstory._id, openFirstScene);
            }
        } else {
            getStoryFromServer($routeParams.storyid, openFirstScene);
        }
    }

    /** CANVAS CLASSES ENZO */

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

        if (!$scope.showtextassetedit) {
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
            var canvas = document.getElementById('preview');
            if (canvas !== null && canvas !== undefined) {
                canvasstate.valid = false;
                canvasstate.draw();
            }
        }

        if(this.assetoption !== null && this.assetoption !== undefined) {
            if(this.assetoption.type === "Scenario") {
                if($scope.currentstory.scenarioorder.indexOf(this.assetoption.scenarioid) === -1) {
                    this.assetoption = null;
                }
            }
        }

        this.imgNew.onload = onImageLoad;

    }

    Asset.prototype.draw = function (ctx) {
        var i, cur, half,
            locx = this.x,
            locy = this.y;

        ctx.drawImage(this.imgNew, locx, locy, this.w, this.h);
    };

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

        this.shapes = [];  // the collection of things to be drawn
        this.xratio = canvas.width / parseInt(window.getComputedStyle(document.getElementById("preview"), null).width);
        this.yratio = canvas.height / parseInt(window.getComputedStyle(document.getElementById("preview"), null).height);
       // alert("Canvas width: " + canvas.width + ", Real width: " + parseInt(window.getComputedStyle(document.getElementById("preview"), null).width) + ", ratio: " + this.xratio);
       // alert("Canvas height: " + canvas.height + ", Real height:" + parseInt(window.getComputedStyle(document.getElementById("preview"), null).height) + ", ratio: " + this.yratio);

        myState = this;

        //fixes a problem where double clicking causes text to get selected on the canvas
        canvas.addEventListener('selectstart', function (e) {
            e.preventDefault();
            return false;
        }, false);

        canvas.addEventListener('mousedown', function (e) {
            var mouse = myState.getMouse(e),
                mx = mouse.x * myState.xratio,
                my = mouse.y * myState.yratio,
                mySel,
                shapes = myState.shapes,
                l = shapes.length,
                index;

            for (index = l - 1; index >= 0; index--) {
                mySel = shapes[index];
                if (shapes[index].contains(mx, my)) {
                    if(shapes[index].assetoption !== null && shapes[index].assetoption !== undefined) {
                        if(shapes[index].assetoption.type === "Scene" || shapes[index].assetoption.type === "Scenario") {
                            if(shapes[index].assetoption.type === "Scene") {
                                var currentsceneindex;
                                for(var i = 0; i < $scope.currentscenario.sceneorder.length; i++ ) {
                                    if($scope.currentscenario.sceneorder[i] === $scope.currentscene._id) {
                                        //alert(i);
                                        currentsceneindex = i;
                                        break;
                                    }
                                }

                                if(shapes[index].assetoption.name === "Next") {
                                    if($scope.currentscenario.sceneorder[currentsceneindex + 1] !== null && $scope.currentscenario.sceneorder[currentsceneindex + 1] !== undefined) {
                                        for(var i = 0; i < $scope.scenes.length; i++) {
                                            if($scope.scenes[i]._id === $scope.currentscenario.sceneorder[currentsceneindex + 1]) {
                                                loadScene(i);
                                                break;
                                            }
                                        }
                                    } else {
                                        alert("Next scene does not exist");
                                    }
                                } else if (shapes[index].assetoption.name === "Previous") {
                                    if($scope.currentscenario.sceneorder[currentsceneindex - 1] !== null && $scope.currentscenario.sceneorder[currentsceneindex - 1] !== undefined) {
                                        for(var i = 0; i < $scope.scenes.length; i++) {
                                            if($scope.scenes[i]._id === $scope.currentscenario.sceneorder[currentsceneindex - 1]) {
                                                loadScene(i);
                                                break;
                                            }
                                        }
                                    } else {
                                        alert("Previous scene does not exist");
                                    }
                                }

                            } else if (shapes[index].assetoption.type === "Scenario") {
                                for(var i = 0; i < $scope.currentstory.scenarioorder.length; i++) {
                                    if($scope.currentstory.scenarioorder[i] === shapes[index].assetoption.scenarioid) {
                                        //Scenario bestaat binnen het verhaal, laad hem
                                        openScenario($scope.currentstory.scenarioorder[i], function () {
                                            loadScenarioScenes($scope.currentscenario._id, function () {
                                                //Eerste scenario + bijbehorende scenes zijn succesvol opgehaald. Zet de eerste scene in beeld
                                                for (var i = 0; i < $scope.scenes.length; i++ ) {
                                                    if($scope.scenes[i]._id === $scope.currentscenario.sceneorder[0]){
                                                        $scope.currentscene = $scope.scenes[i];
                                                        loadScene(i);
                                                        break;
                                                    }
                                                }
                                            });
                                        });
                                        break;
                                    }
                                    if(i === $scope.currentstory.scenarioorder.length - 1) {
                                        alert("Scenario doesn't exist within this story");
                                    }
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }, true);

        canvas.addEventListener('mousemove', function (e) {
            var mouse = myState.getMouse(e),
                mx = mouse.x * myState.xratio,
                my = mouse.y * myState.yratio,
                mySel,
                shapes = myState.shapes,
                l = shapes.length,
                index;

           // alert(window.getComputedStyle(document.getElementById("preview"), null).height);
            for (index = l - 1; index >= 0; index--) {
                mySel = shapes[index];
                if (shapes[index].contains(mx, my)) {
                    if(shapes[index].assetoption !== null && shapes[index].assetoption !== undefined) {
                        if(shapes[index].assetoption.type === "Scene" || shapes[index].assetoption.type === "Scenario") {
                            this.style.cursor = "pointer";
                            break;
                        } else {
                            this.style.cursor = "default";
                        }
                    } else {
                        this.style.cursor = "default";
                    }
                }
                if(index === 0) {
                    this.style.cursor = "default";
                }
            }

        }, true);
    }

    CanvasState.prototype.loadScene = function (scene) {
        var i, assets;
        $scope.currentscene = scene;
        this.shapes = [];
        this.clear();
        assets = scene.assets;
        if (assets !== undefined && assets !== null) {
            for (i = 0; i < assets.length; i++) {
                if (assets[i].text === undefined || assets[i].text === null){
                    canvasstate.addShape(new Asset(assets[i].x, assets[i].y, assets[i].imagepath, canvasstate, assets[i].width, assets[i].height, assets[i].assetoption));
                } else {
                    canvasstate.addShape(new TextAsset(assets[i].x, assets[i].y, assets[i].width, canvasstate, assets[i].text, assets[i].assetoption));
                }
            }
            this.draw();
        }
    };

    CanvasState.prototype.addShape = function (shape) {
        this.shapes.push(shape);
    };

    CanvasState.prototype.clear = function () {
        this.ctx.clearRect(0, 0, parseInt(window.getComputedStyle(this.canvas, null).width, 10), parseInt(window.getComputedStyle(this.canvas, null).height, 10));
    };

    CanvasState.prototype.draw = function () {
        // if our state is invalid, redraw and validate!
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
            if (shape.x > parseInt(window.getComputedStyle(this.canvas, null).width, 10) || shape.y > parseInt(window.getComputedStyle(this.canvas, null).height, 10) ||
                shape.x + shape.w < 0 || shape.y + shape.h < 0) {
                outofcanvas = true;
            }
            if (!outofcanvas) {
                shapes[i].draw(ctx);
            }

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

    /**
     * When the window resizes, the width and height properties of the canvas need to be set aswell.
     */
    window.addEventListener('resize', function () {
        var canvas = document.getElementById('preview');
        if (canvas !== null && canvas !== undefined) {
            // canvas.setAttribute('width',  parseInt(window.getComputedStyle(canvas, null).width, 10).toString());
           // canvas.setAttribute('height', parseInt(window.getComputedStyle(canvas, null).height, 10).toString());
            canvasstate.xratio = canvas.width / parseInt(window.getComputedStyle(document.getElementById("preview"), null).width);
            canvasstate.yratio = canvas.height / parseInt(window.getComputedStyle(document.getElementById("preview"), null).height);
            canvasstate.valid = false;
            canvasstate.draw();
        }
    });

    /**
     * Called at the start of the application. A new canvas state object is made and the height and width properties
     * of the canvas are set. This canvasstate will be used for future reference.
     */
    function initCanvas() {
        var canvas = document.getElementById(('preview')), testcanvas;
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

    initCanvas();
    openStory();

}]);