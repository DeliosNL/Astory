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


    /* Drag and drop zooi */
    function Shape(x, y, imgpath, fill) {
        this.imgNew = new Image();
        this.imgNew.src = imgpath;
        this.x = x || 0;
        this.y = y || 0;
        this.w = this.imgNew.width || 0;
        this.h = this.imgNew.height || 0;
        ;
        this.fill = fill || '#AAAAAA';
    }

    // Draws this shape to a given context
    Shape.prototype.draw = function (ctx) {
        var locx = this.x;
        var locy = this.y;
        ctx.drawImage(this.imgNew, locx, locy);
    }

    // Determine if a point is inside the shape's bounds
    Shape.prototype.contains = function (mx, my) {
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


        this.valid = false; // when set to false, the canvas will redraw everything
        this.shapes = [];  // the collection of things to be drawn
        this.dragging = false; // Keep track of when we are dragging
        // the current selected object. In the future we could turn this into an array for multiple selection
        this.selection = null;
        this.dragoffx = 0; // See mousedown and mousemove events for explanation
        this.dragoffy = 0;

        var myState = this;

        //fixes a problem where double clicking causes text to get selected on the canvas
        canvas.addEventListener('selectstart', function (e) {
            e.preventDefault();
            return false;
        }, false);

        // Up, down, and move are for dragging
        canvas.addEventListener('mousedown', function (e) {
            var mouse = myState.getMouse(e);
            var mx = mouse.x;
            var my = mouse.y;
            var shapes = myState.shapes;
            var l = shapes.length;
            for (var i = l - 1; i >= 0; i--) {
                if (shapes[i].contains(mx, my)) {
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
                myState.selection = null;
                myState.valid = false; // Need to clear the old selection border
            }
        }, true);

        canvas.addEventListener('mousemove', function (e) {
            if (myState.dragging) {
                var mouse = myState.getMouse(e);
                // We don't want to drag the object by its top-left corner, we want to drag it
                // from where we clicked. Thats why we saved the offset and use it here
                myState.selection.x = mouse.x - myState.dragoffx;
                myState.selection.y = mouse.y - myState.dragoffy;
                myState.valid = false; // Something's dragging so we must redraw
            }
        }, true);

        canvas.addEventListener('mouseup', function (e) {
            myState.dragging = false;
        }, true);

        // double click for making new shapes
        canvas.addEventListener('dblclick', function (e) {
            var mouse = myState.getMouse(e);
            myState.addShape(new Shape(mouse.x - 10, mouse.y - 10, 20, 20, 'rgba(0,255,0,.6)'));
        }, true);

        // **** Options! ****

        this.selectionColor = '#CC0000';
        this.selectionWidth = 2;
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

            // draw selection
            // right now this is just a stroke along the edge of the selected Shape
            if (this.selection != null) {
                ctx.strokeStyle = this.selectionColor;
                ctx.lineWidth = this.selectionWidth;
                var mySel = this.selection;
                ctx.strokeRect(mySel.x, mySel.y, mySel.w, mySel.h);
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
        canvasstate.addShape(new Shape(assetx, assety, event.dataTransfer.getData("imagepath")));
    }

    $scope.dragAsset = function (event) {
        event.dataTransfer.setData("imagepath", event.target.getAttribute('src'));
    }

    var editor = document.getElementById('editor');
    editor.addEventListener('dragover', allowDrop);
    editor.addEventListener('drop', dropAsset);

    initCanvas();
}]);
