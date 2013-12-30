aStory.controller('editScenarioController', ['$scope', 'scenario', '$modalInstance', function ($scope, scenario, $modalInstance) {
    $scope.scenario = scenario;
    $scope.newdata = {
        name: $scope.scenario.title
    };

    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.saveScenario = function () {
        scenario.title = $scope.newdata.name;
        $modalInstance.close();
    };

}]);

aStory.controller('editorController', ['$scope', '$modal', 'storiesService', '$location', function ($scope, $modal, storiesService, $location) {
    $scope.showassetproperties = false;

    $scope.story = storiesService.currentstory;
    if ($scope.story == null) {
        alert("Geen story geselecteerd");
        $location.path('/stories');
    }

    $scope.showStoryPopup = function (index) {
        var modalInstance = $modal.open({
            templateUrl: '../partials/storypopup.html',
            controller: 'storypopupController',
            resolve: {
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
    }

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

    $scope.scenes = [
        {
            "image": "sceneexample.png"
        },
        {
            "image": "sceneexample.png"
        },
        {
            "image": "sceneexample.png"
        },
        {
            "image": "sceneexample.png"
        },
        {
            "image": "sceneexample.png"
        }
    ]

    $scope.addScene = function() {
        $scope.scenes.push({
            "image": "sceneexample.png"
        });
    };

    $scope.addScenarioEvent = function(index){
        $scope.safeApply(function() {
            alert("Scenario: " + $scope.scenarios[index].title +  " is toegevoegd als assetoptie!");
            $scope.showassetproperties = false;
        });
    }

    $scope.addSceneByIndex = function(index) {
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
    }

    $scope.showScenarioPopup = function () {
        var scenariopopup = $modal.open({
            templateUrl: '../partials/createscenariopopup.html',
            controller: 'scenariopopupController',
            resolve: {
                scenarios: function () {
                    return $scope.scenarios;
                }
            }
        });
    };

    $scope.scenarios = [
        {
            title: "Castel: The beginning of the journey",
            linkfrom: [],
            linkto: [],
            scenes: []
        },
        {
            title: "The Journey: Part 2",
            linkfrom: [],
            linkto: [],
            scenes: []
        }
    ];

    $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    /* Drag and drop zooi */

    function SelectionBox(x, y, state) {
        "use strict";
        this.state = state;
        this.x = x || 0;
        this.y = y || 0;
    }

    function Asset(x, y, imgpath, state) {
        this.imgNew = new Image();
        this.imgNew.src = imgpath;
        this.x = x || 0;
        this.y = y || 0;
        this.w = this.imgNew.width || 500;
        this.h = this.imgNew.height || 500;
        this.state = state;
        var that = this;

        this.imgNew.onload = onImageLoad;

        function onImageLoad() {
            if(this.width > this.height) {
                while(this.width > 500) {
                    this.width = this.width / 2;
                    this.height = this.height / 2;
                }
            } else {
                while(this.height > 500){
                    this.height = this.height / 2;
                    this.width = this.width / 2;
                }
            }
            that.w = this.width;
            that.h = this.height;
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

        if(this.state.selection == this){
            ctx.strokeStyle = this.state.selectionColor;
            ctx.lineWidth = this.state.selectionWidth;
            ctx.strokeRect(this.x, this.y, this.w, this.h);

           half = this.state.selectionboxsize / 2;
            // 0 1 2
            // 3   4
            // 5 6 7
            this.state.selectionHandles[0].x = this.x-half;
            this.state.selectionHandles[0].y = this.y-half;

            this.state.selectionHandles[1].x = this.x + this.w/2 -half;
            this.state.selectionHandles[1].y = this.y - half;

            this.state.selectionHandles[2].x = this.x + this.w - half;
            this.state.selectionHandles[2].y = this.y - half;

            //middle left
            this.state.selectionHandles[3].x = this.x-half;
            this.state.selectionHandles[3].y = this.y+this.h/2-half;

            //middle right
            this.state.selectionHandles[4].x = this.x+this.w-half;
            this.state.selectionHandles[4].y = this.y+this.h/2-half;

            //bottom left, middle, right
            this.state.selectionHandles[6].x = this.x+this.w/2-half;
            this.state.selectionHandles[6].y = this.y+this.h-half;

            this.state.selectionHandles[5].x = this.x-half;
            this.state.selectionHandles[5].y = this.y+this.h-half;

            this.state.selectionHandles[7].x = this.x+this.w-half;
            this.state.selectionHandles[7].y = this.y+this.h-half;

            for (i = 0; i < 8; i += 1) {
                cur = this.state.selectionHandles[i];
                ctx.fillRect(cur.x, cur.y, this.state.selectionboxsize, this.state.selectionboxsize);
            }
        }

        ctx.drawImage(this.imgNew, locx, locy, this.w, this.h);
    }

    // Determine if a point is inside the shape's bounds
    Asset.prototype.contains = function (mx, my) {
        // All we have to do is make sure the Mouse X,Y fall in the area between
        // the shape's X and (X + Height) and its Y and (Y + Height)
        return  (this.x <= mx) && (this.x + this.w >= mx) &&
            (this.y <= my) && (this.y + this.h >= my);
    }

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

        // Up, down, and move are for dragging
        canvas.addEventListener('mousedown', function (e) {
            var assetpropertiesxoffset = myState.assetpropertiesxoffset;
            var assetpropertiesyoffset = myState.assetpropertiesyoffset;
            var assetpropertiesmenu = myState.assetpropertiesmenu
            var mouse = myState.getMouse(e);
            var mx = mouse.x;
            var my = mouse.y;
            var shapes = myState.shapes;
            var l = shapes.length;

            if(myState.expectResize !== -1){
                myState.resizeDragging = true;
                return;
            }

            for (var i = l - 1; i >= 0; i--) {
                if (shapes[i].contains(mx, my)) {
                    $scope.safeApply(function(){
                        assetpropertiesmenu.style.left = shapes[i].x + assetpropertiesxoffset + shapes[i].w + "px" ;
                        assetpropertiesmenu.style.top = shapes[i].y + assetpropertiesyoffset + "px";
                        $scope.showassetproperties = true;
                    });
                    var mySel = shapes[i];
                    // Keep track of where in the object we clicked
                    // so we can move it smoothly (see mousemove)
                    myState.dragoffx = mx - mySel.x;
                    myState.dragoffy = my - mySel.y;
                    myState.dragging = true;
                    myState.selection = mySel;
                    myState.valid = false;
                    return;
                }
            }
            // havent returned means we have failed to select anything.
            // If there was an object selected, we deselect it
            if (myState.selection) {
                $scope.safeApply(function(){
                   $scope.showassetproperties = false;
                });
                myState.selection = null;
                myState.valid = false; // Need to clear the old selection border
            }
        }, true);

        canvas.addEventListener('mousemove', function (e) {
            var mouse = myState.getMouse(e),
                mx = mouse.x,
                my= mouse.y,
                oldx, oldy, i, cur;
            if (myState.dragging) {
                $scope.safeApply(function(){
                    $scope.showassetproperties = false;
                })
                // We don't want to drag the object by its top-left corner, we want to drag it
                // from where we clicked. Thats why we saved the offset and use it here
                myState.selection.x = mx - myState.dragoffx;
                myState.selection.y = my - myState.dragoffy;
                myState.valid = false; // Something's dragging so we must redraw
            } else if (myState.resizeDragging) {
                $scope.safeApply(function(){
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

            if(myState.selection !== null && !myState.resizeDragging){
                for(i = 0; i < 8; i+= 1){
                    cur = myState.selectionHandles[i];
                    if(mx >= cur.x && mx <= cur.x + myState.selectionboxsize &&
                        my >= cur.y && my <= cur.y + myState.selectionboxsize){
                        myState.expectResize = i;
                        myState.valid = false;

                        switch(i) {
                            case 0:
                                this.style.cursor='nw-resize';
                                break;
                            case 1:
                                this.style.cursor='n-resize';
                                break;
                            case 2:
                                this.style.cursor='ne-resize';
                                break;
                            case 3:
                                this.style.cursor='w-resize';
                                break;
                            case 4:
                                this.style.cursor='e-resize';
                                break;
                            case 5:
                                this.style.cursor='sw-resize';
                                break;
                            case 6:
                                this.style.cursor='s-resize';
                                break;
                            case 7:
                                this.style.cursor='se-resize';
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
                $scope.safeApply(function() {
                    $scope.showassetproperties = true;
                    myState.assetpropertiesmenu.style.left = 0 + myState.selection.x + myState.assetpropertiesxoffset + myState.selection.w + "px" ;
                    myState.assetpropertiesmenu.style.top = myState.selection.y + myState.assetpropertiesyoffset + "px";
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

    CanvasState.prototype.addShape = function (shape) {
        this.shapes.push(shape);
        this.valid = false;
    }

    CanvasState.prototype.clear = function () {
        this.ctx.clearRect(0, 0, parseInt(window.getComputedStyle(this.canvas).width), parseInt(window.getComputedStyle(this.canvas).height));
    }

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
    }

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
    }

    var pos;
    var canvasstate;

    $scope.get_pos = function (ev) {
        pos = [ev.pageX, ev.pageY];
    }

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
    }

    $scope.dragAsset = function (event) {
        event.dataTransfer.setData("imagepath", event.target.getAttribute('src'));
    }

    var editor = document.getElementById('editor');
    editor.addEventListener('dragover', allowDrop);
    editor.addEventListener('drop', dropAsset);

    initCanvas();
}]);

