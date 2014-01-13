describe('Astory controllers', function () {
    beforeEach(module('aStory'));

    describe('editorController', function () {
        var scope, $httpBackend, ctrl;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $routeParams, $controller) {
            $httpBackend = _$httpBackend_;

            scope = $rootScope.$new();
            scope.story = {
                "__v": 0,
                "_id": "52ced5e447cc58783a000001",
                "creator": "52c5955b5acd84772b000001",
                "date": "Thu Jan 09 2014",
                "image": "sceneexample.png",
                "name": "testverhaal",
                "scenarioorder": [
                    "52cef1624d4148fa45000003"
                ]
            };
            $httpBackend.expectGET('/scenarios/52ced5e447cc58783a000001').respond(
                {
                    "meta": {
                        "action": "list",
                        "timestamp": "2014-01-10T18:38:11.683Z",
                        "filename": "/home/niels/Project Cria/Astory/server/app/controllers/astory.js"
                    },
                    "doc": [
                        {
                            "__v": 0,
                            "_id": "52cef1624d4148fa45000003",
                            "creator": "52c5955b5acd84772b000001",
                            "linkfrom": [],
                            "linkto": [],
                            "name": "fadsfsad",
                            "sceneorder": [
                                "52cef1734d4148fa45000005"
                            ],
                            "story": "52ced5e447cc58783a000001"
                        }
                    ],
                    err: null
                }
            );
            var scenesresponse = {
                "meta": {
                    "action": "list",
                    "timestamp": "2014-01-10T19:14:40.574Z",
                    "filename": "/home/niels/Project Cria/Astory/server/app/controllers/astory.js"
                },
                "doc": [
                    {
                        "__v": 0,
                        "_id": "52cef1734d4148fa45000005",
                        "assets": [
                            {
                                "imagepath": "http://localhost:8500/images/Assets/Rendier.png",
                                "assetoption": {
                                    "scenarioid": "52cef2798909bd6146000001",
                                    "type": "Scenario",
                                    "name": "asf"
                                },
                                "height": 500,
                                "width": 486,
                                "y": 109,
                                "x": 345
                            }
                        ],
                        "background": "images/Assets/Achtergrond3.png",
                        "creator": "52c5955b5acd84772b000001",
                        "date": "2014-01-09T18:54:09.505Z",
                        "image": "sceneexample.png",
                        "scenario": "52cef1624d4148fa45000003"
                    }
                ],
                "err": null
            };
            $httpBackend.expectGET('/scenes/52cef1624d4148fa45000003').respond(scenesresponse);
            $httpBackend.expectGET('/scenes/52cef1624d4148fa45000003').respond(scenesresponse);
            ctrl = $controller('editorController', {$scope: scope});
        }));

        it("has a current story", function () {
            expect(scope.story).not.toBeUndefined();
            expect(scope.story._id).toBe("52ced5e447cc58783a000001");
            expect(scope.story.scenarioorder.length).toBe(1);
        });

        it("Sets the current scenario on load", function () {
            $httpBackend.flush();
            expect(scope.currentscenario).not.toBeUndefined();
            expect(scope.currentscenario._id).toBe("52cef1624d4148fa45000003");
        });

        it("Opens the first scene on load", function () {
            $httpBackend.flush();
            expect(scope.currentscene).not.toBeUndefined();
            expect(scope.currentscene._id).toBe('52cef1734d4148fa45000005');
        });

        it("Creates an asset on the canvasstate", function () {
            $httpBackend.flush();
            expect(scope.getCanvasstate().shapes).not.toBeUndefined();
            expect(scope.getCanvasstate().shapes.length).toBe(1);
            expect(scope.getCanvasstate().shapes[0].y).toBe(109);
            expect(scope.getCanvasstate().shapes[0].x).toBe(345);
        });

        function addscene (scope) {

        }

        it("Updates assets both locally and on the server when an asset is added", function () {
            $httpBackend.flush();
            expect(scope.getCanvasstate().shapes).not.toBeUndefined();
            expect(scope.getCanvasstate().shapes.length).toBe(1);
            $httpBackend.expectPUT('/scene/52cef1734d4148fa45000005').respond(
                {
                    "meta": {
                        "action": "update",
                        "timestamp": "2014-01-10T20:08:24.446Z",
                        "filename": "/home/niels/Project Cria/Astory/server/app/controllers/astory.js"
                    },
                    "doc": {
                        "__v": 0,
                        "_id": "52cef1734d4148fa45000005",
                        "creator": "52c5955b5acd84772b000001",
                        "scenario": "52cef1624d4148fa45000003",
                        "image": "sceneexample.png",
                        "date": "2014-01-09T18:54:09.505Z",
                        "assets": [
                            {
                                "imagepath": "http://localhost:8500/images/Assets/Rendier.png",
                                "assetoption": {
                                    "scenarioid": "52cef2798909bd6146000001",
                                    "type": "Scenario",
                                    "name": "asf"
                                },
                                "height": 500,
                                "width": 486,
                                "y": 109,
                                "x": 345
                            },
                            {
                                "imagepath": "http://localhost:8500/images/Assets/Appel.png",
                                "assetoption": {
                                },
                                "height": 500,
                                "width": 486,
                                "y": 109,
                                "x": 345
                            }
                        ],
                        "background": "images/Assets/Achtergrond3.png"
                    },
                    "err": null
                }
            );

            scope.dropAsset({
                preventDefault: function () {
                    return 0;
                },
                dataTransfer : {
                    getData: function () {
                        return "http://localhost:8500/images/Assets/Appel.png";
                    }
                },
                pageX: 500,
                pageY: 200
            });

            $httpBackend.flush();
            expect(scope.getCanvasstate().shapes.length).toBe(2);

        });

        it("Has no linkto and linkfrom blocks on load", function () {
            $httpBackend.flush();
            expect(scope.currentscenario.linkto.length).toBe(0);
            expect(scope.currentscenario.linkto).not.toBeUndefined();
            expect(scope.currentscenario.linkfrom.length).toBe(0);
            expect(scope.currentscenario.linkfrom).not.toBeUndefined();
        });

        function addScene(scope) {

        }

        it("Saves new scenes on the server and refreshes them locally", function () {
            $httpBackend.flush();
            expect(scope.scenes.length).toBe(1);
            $httpBackend.expectPOST('/scenes/52cef1624d4148fa45000003').respond(
                {
                    "meta": {
                        "action": "create",
                        "timestamp": "2014-01-10T20:22:59.578Z",
                        "filename": "/home/niels/Project Cria/Astory/server/app/controllers/astory.js"
                    },
                    "doc": {
                        "__v": 0,
                        "scenario": "52cef1624d4148fa45000003",
                        "creator": "52c5955b5acd84772b000001",
                        "_id": "52d056a3ef17c61a02000002",
                        "image": "sceneexample.png",
                        "date": "2014-01-10T20:06:15.958Z",
                        "assets": [],
                        "background": "images/Assets/Achtergrond1A.png"
                    },
                    "err": null
                }
            );

            $httpBackend.expectGET('/scenarios/52ced5e447cc58783a000001').respond(
                {
                    "meta": {
                        "action": "list",
                        "timestamp": "2014-01-10T18:38:11.683Z",
                        "filename": "/home/niels/Project Cria/Astory/server/app/controllers/astory.js"
                    },
                    "doc": [
                        {
                            "__v": 0,
                            "_id": "52cef1624d4148fa45000003",
                            "creator": "52c5955b5acd84772b000001",
                            "linkfrom": [],
                            "linkto": [],
                            "name": "fadsfsad",
                            "sceneorder": [
                                "52cef1734d4148fa45000005",
                                "52d056a3ef17c61a02000002"
                            ],
                            "story": "52ced5e447cc58783a000001"
                        }
                    ],
                    err: null
                }
            );

            $httpBackend.expectGET('/scenes/52cef1624d4148fa45000003').respond(
                {
                    "meta": {
                        "action": "list",
                        "timestamp": "2014-01-10T19:14:40.574Z",
                        "filename": "/home/niels/Project Cria/Astory/server/app/controllers/astory.js"
                    },
                    "doc": [
                        {
                            "__v": 0,
                            "_id": "52cef1734d4148fa45000005",
                            "assets": [
                                {
                                    "imagepath": "http://localhost:8500/images/Assets/Rendier.png",
                                    "assetoption": {
                                        "scenarioid": "52cef2798909bd6146000001",
                                        "type": "Scenario",
                                        "name": "asf"
                                    },
                                    "height": 500,
                                    "width": 486,
                                    "y": 109,
                                    "x": 345
                                }
                            ],
                            "background": "images/Assets/Achtergrond3.png",
                            "creator": "52c5955b5acd84772b000001",
                            "date": "2014-01-09T18:54:09.505Z",
                            "image": "sceneexample.png",
                            "scenario": "52cef1624d4148fa45000003"
                        },
                        {
                            "__v": 0,
                            "scenario": "52cef1624d4148fa45000003",
                            "creator": "52c5955b5acd84772b000001",
                            "_id": "52d056a3ef17c61a02000002",
                            "image": "sceneexample.png",
                            "date": "2014-01-10T20:06:15.958Z",
                            "assets": [],
                            "background": "images/Assets/Achtergrond1A.png"
                        }
                    ],
                    "err": null
                }
            );

            $httpBackend.expectGET('/scenes/52cef1624d4148fa45000003').respond(
                {
                    "meta": {
                        "action": "list",
                        "timestamp": "2014-01-10T19:14:40.574Z",
                        "filename": "/home/niels/Project Cria/Astory/server/app/controllers/astory.js"
                    },
                    "doc": [
                        {
                            "__v": 0,
                            "_id": "52cef1734d4148fa45000005",
                            "assets": [
                                {
                                    "imagepath": "http://localhost:8500/images/Assets/Rendier.png",
                                    "assetoption": {
                                        "scenarioid": "52cef2798909bd6146000001",
                                        "type": "Scenario",
                                        "name": "asf"
                                    },
                                    "height": 500,
                                    "width": 486,
                                    "y": 109,
                                    "x": 345
                                }
                            ],
                            "background": "images/Assets/Achtergrond3.png",
                            "creator": "52c5955b5acd84772b000001",
                            "date": "2014-01-09T18:54:09.505Z",
                            "image": "sceneexample.png",
                            "scenario": "52cef1624d4148fa45000003"
                        },
                        {
                            "__v": 0,
                            "scenario": "52cef1624d4148fa45000003",
                            "creator": "52c5955b5acd84772b000001",
                            "_id": "52d056a3ef17c61a02000002",
                            "image": "sceneexample.png",
                            "date": "2014-01-10T20:06:15.958Z",
                            "assets": [],
                            "background": "images/Assets/Achtergrond1A.png"
                        }
                    ],
                    "err": null
                }
            );
            scope.addScene();
            $httpBackend.flush();
            expect(scope.scenes.length).toBe(2);

        });

    });

    describe('registerController', function () {

    });

    describe('loginController', function () {
        it("Doesn't show the attempt as failed right away", function () {
            var scope;
            beforeEach(inject(function ($rootScope) {
                scope = $rootScope.$new();
            }));
            expect(scope.failedloginattempt).toBe(false);
        });
    });

    describe('headerController', function () {

    });
});