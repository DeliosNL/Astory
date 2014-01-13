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


        it("Updates the canvas background both locally and on the server", function () {
            $httpBackend.flush();
            var fakeevent = {
                preventDefault: function () {
                    return 0;
                },
                dataTransfer : {
                    getData: function () {
                        return "images/Assets/Achtergrond1A.png";
                    }
                },
                pageX: 500,
                pageY: 200
            };

            scope.currentscene = {
                _id : "52cef1734d4148fa45000005"
            };

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
                        "background": "images/Assets/Achtergrond1A.png"
                    },
                    "err": null
                }
            );
            scope.dropAsset(fakeevent);
            $httpBackend.flush();
            expect(scope.currentscene.background).toBe("images/Assets/Achtergrond1A.png");
        });

        it("Has no linkto and linkfrom blocks on load", function () {
            $httpBackend.flush();
            expect(scope.currentscenario.linkto.length).toBe(0);
            expect(scope.currentscenario.linkto).not.toBeUndefined();
            expect(scope.currentscenario.linkfrom.length).toBe(0);
            expect(scope.currentscenario.linkfrom).not.toBeUndefined();
        });

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

        it("Adds alerts and removes them automatically", function () {
            scope.addAlert("success", "Test");
            expect(scope.alerts.length).toBe(1);
            setTimeout(function () {
                expect(scope.alerts.length).toBe(0);
            }, 3000);
        });

        it("Can close alerts", function () {
            scope.addAlert("success", "Test");
            expect(scope.alerts.length).toBe(1);
            scope.closeAlert();
            expect(scope.alerts.length).toBe(0);
        });

        it("Saves an asset's next-scene action", function () {
            scope.selectedAsset = {
                "imagepath": "http://localhost:8500/images/Assets/Rendier.png",
                "assetoption": {},
                "height": 500,
                "width": 486,
                "y": 109,
                "x": 345
            };



            //scope.addNextSceneAction();
        });

        it("Saves an asset's previous-scene action", function () {

        });

    });

    describe('registerController', function () {
        var scope, ctrl, $httpBackend;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $routeParams, $controller, loggedinService) {
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            ctrl = $controller('registerController', {$scope: scope});
            scope.birthdatemonth = 5;
            scope.birthdateday = 15;
            scope.birthdateyear = 1990;
            scope.username = "testaccount";
            scope.password = "test";
            scope.email = "test@test.nl";

        }));

        it("Starts out with an invalid birthday", function () {
            expect(scope.birthdateinvalid).toBeTruthy();
        });

        it("Has birthdate fields", function () {
            expect(scope.days.length).toBe(31);
            expect(scope.months.length).toBe(12);
            expect(scope.years.length).toBeGreaterThan(50);
        });

        it("Knows when you use an already registered username", function () {
            expect(scope.usedusername).toBeFalsy();
            $httpBackend.expectPOST('/users').respond(
                {
                    validationerror: "Username already exists"
                }
            );
            scope.register();
            $httpBackend.flush();
            expect(scope.usedusername).toBeTruthy();
        });

        it("Knows when you use an already registered e-mail", function () {
            expect(scope.usedemail).toBeFalsy();
            $httpBackend.expectPOST('/users').respond(
                {
                    validationerror: "Email already exists"
                }
            );
            scope.register();
            $httpBackend.flush();
            expect(scope.usedemail).toBeTruthy();
        });

    });

    describe('loginController', function ($controller) {
        var scope, ctrl, $httpBackend, loggedinservice;

        beforeEach(inject(function (_$httpBackend_, $rootScope, $routeParams, $controller, loggedinService) {
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            ctrl = $controller('loginController', {$scope: scope});
            loggedinservice = loggedinService;
        }));

        it("Doesn't show the attempt as failed right away", function () {
            expect(scope.failedloginattempt).toBe(false);
        });

        it("Knows you're not logged in yet", function () {
            expect(scope.failedloginattempt).toBe(false);
        });

        it("Sets your logged-in status when successfully logged in", function () {
            expect(loggedinservice.loggedin).toBeFalsy();
            $httpBackend.expectPOST('/login').respond(
                {
                    "username": "testaccount",
                    "email": "test@test.nl",
                    "passwordhash": "����\u001b��\u0001`֡s6� ��26V\"\b��&.���sX$�U�&\u0015k�J�fyR���z�IU\u000f�$�N�\u000b\u0005Q�2�\u0002��\u0019��\u0017������%\u0004���X����'�(ÚyG@[D3jI�g���!�\u0001�}�`\u0015�.�̅\\O�\u0005�\f����4",
                    "salt": "/a/yHs5jyZrdSE0yDvjrqK1pSWyJeYOoihv0ZJE6vHT5rl3RZ3ETsN31qCsib2LNq5NYsxfeOy1AXo/AdwoHq8AU0sJ2zS9TqgIp0trYZaIgal4J/Wt7GezdffuU50vlBs0Aaukyt/cWXJH8+Znf7RaBd/Pz9FZHEq/BKL7Y/zI=",
                    "_id": "52d3a5d954cb430610000002",
                    "__v": 0,
                    "birthdate": "1994-05-10T22:00:00.000Z"
                }
            );
            scope.login();
            $httpBackend.flush();
            expect(loggedinservice.loggedin).toBeTruthy();
        });

        it("Doesn't set your logged-in status when your login attempt fails", function () {
            $httpBackend.expectPOST('/login').respond(401);
            scope.login();
            $httpBackend.flush();
            expect(loggedinservice.loggedin).toBeFalsy();
        });

    });

    describe('headerController', function () {

    });
});