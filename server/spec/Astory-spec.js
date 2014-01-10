

var request = require('request');

describe('AStory', function(){
    beforeEach(function() {
        request.post({
            url: "http://localhost:8500/login",
            form : {
                username: "test",
                password: "testtest"
            }
        }, function(error, response, body) {
        });
    });

    it("knows you are not logged in", function(done) {
        request("http://localhost:8500/loggedin", function(error, response, body){
            expect(body).toBe('0');
            done();
        });
    });

    it("Knows you're logged in when you're actually logged in", function(done) {
        request.post({ // Met dit request log ik mij in op de server
            url: "http://localhost:8500/login",
            form : {
                username: "test",
                password: "testtest"
            }
        }, function(error, response, body) {
            var response = JSON.parse(body);
            expect(response.username).toBe("test"); // Heb een document teruggekregen, ik ben ingelogd
            request("http://localhost:8500/loggedin", function(error, response, body){ // Nu ga ik kijken of ik ingelogd ben gebleven.
                expect(body).not.toBe('0'); //Dit faalt, als ik in postman dezelfde stappen volg dan krijg ik een retObj met de user terug.
                done();
            });
            done();
        });
    });

    it("Does not register accounts that already exist", function(done) {
        request.post({
            url: "http://localhost:8500/users",
            form : {
                username: "test",
                password: "testtest",
                email: "test@test.nl",
                birthdate: new Date()
            }
        }, function(error, response, body) {
            var response = JSON.parse(body);
            expect(response.validationerror).not.toBeUndefined();
            expect(response.validationerror).toBe("Username already exists");
            done();
        });
    });

    it("Logs you out", function (done){
        request("http://localhost:8500/logout", function(error, response, body){
            expect(body).toBe('Logout successfull');
            done();
        });
    });

    it("Doesn't show you stories if you're not logged in", function (done) {
        request("http://localhost:8500/stories", function(error, response, body){
            expect(body).toBe("Unauthorized");
            done();
        });
    });

    it("Doesn't let you create stories if you're not logged in", function (done) {
        request.post({
            url: "http://localhost:8500/stories",
            form : {
                name: "teststory"
            }
        }, function(error, response, body) {
            expect(body).toBe("Unauthorized");
            done();
        });
    });

    it("Doesn't let you update stories if you're not logged in", function (done) {
        request.put({
            url: "http://localhost:8500/stories/52ced5e447cc58783a000001",
            form : {
                "name" : "test"
            }
        }, function(error, response, body) {
            expect(body).toBe("Unauthorized");
            done();
        });
    });

    it("Doesn't let you retrieve scenario's if you're not logged in", function(done) {
        request("http://localhost:8500/scenarios/52ced5e447cc58783a000001", function(error, response, body){
            expect(body).toBe("Unauthorized");
            done();
        });
    });

    it("Doesn't let you create scenarios if you're not logged in", function (done) {
        request.post({
            url: "http://localhost:8500/scenarios/52ced5e447cc58783a000001",
            form : {
                name: "testscenario"
            }
        }, function(error, response, body) {
            expect(body).toBe("Unauthorized");
            done();
        });
    });

    it("Doesn't let you retrieve a single scenario if you're not logged in", function(done) {
        request("http://localhost:8500/scenario/52cef1624d4148fa45000003", function(error, response, body){
            expect(body).toBe("Unauthorized");
            done();
        });
    });

    it("Doesn't let you update a scenario if you're not logged in", function (done) {
        request.put({
            url: "http://localhost:8500/scenario/52cef1624d4148fa45000003",
            form : {
                "name" : "test"
            }
        }, function(error, response, body) {
            expect(body).toBe("Unauthorized");
            done();
        });
    });

    it("Doesn't let you retrieve scenes if you're not logged in", function(done) {
        request("http://localhost:8500/scenes/52cef1624d4148fa45000003", function(error, response, body){
            expect(body).toBe("Unauthorized");
            done();
        });
    });

    it("Doesn't let you create scenes if you're not logged in", function(done) {
        request.post({
            url: "http://localhost:8500/scenes/52cef1624d4148fa45000003",
            form : {
            }
        }, function(error, response, body) {
            expect(body).toBe("Unauthorized");
            done();
        });
    });

    it("Doesn't let you retrieve a single scene if you're not logged in", function(done) {
        request("http://localhost:8500/scene/52cef1734d4148fa45000005", function(error, response, body){
            expect(body).toBe("Unauthorized");
            done();
        });
    });

    it("Doesn't let you update a single scene if you're not logged in", function(done) {
        request.put({
            url: "http://localhost:8500/scene/52cef1734d4148fa45000005",
            form : {
                assets: []
            }
        }, function(error, response, body) {
            expect(body).toBe("Unauthorized");
            done();
        });
    });

});

