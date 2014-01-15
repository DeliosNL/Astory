'use strict';
var login = function() {
    browser().navigateTo('/#/login');
    sleep(2);
    input("username").enter("testaccount");
    input("password").enter("testtest");
    element("#loginbutton").click();
    sleep(0.5);
};

var logout = function() {
    browser().navigateTo('/#/stories');
    sleep(2);
    element("#accountdropdown").click();
    element(".accountdropdownbuttonlogout").click();
};

describe('Story overview', function () {
    beforeEach(function () {
        login();
        browser().navigateTo('/#/stories');
        sleep(2);
    });

    afterEach(function () {
        logout();
    });

    var oldStoryCount = -2;

    it("is checking the amount of stories", function () {
        element('#ng-view').query(function (el, done) {
            oldStoryCount = el.children().length - 1;
            done();
        });
    });

    it("Can create a new story", function () {
        element('#newstorybutton').click();
        sleep(2);
        input('newstoryname').enter('test');
        element('.bottomrightbutton').click();
        expect(repeater('.story').count()).toMatch(oldStoryCount + 1);
    });

    it("Can delete a story", function () {
        element(".storysettings").click();
        sleep(2);
        element(".bottomleftredtext").click();
        sleep(2);
        element(".bottomrightbutton").click();
        sleep(2);
    });

    it("Can hide and show the account dropdown menu", function () {
        expect(element('#accountdropdown').css('display')).toBe('none');
        element("#navdropdownbutton").click();
        sleep(1);
        expect(element('#accountdropdown').css('display')).toBe('block');
        element("#navdropdownbutton").click();
        sleep(1);
        expect(element('#accountdropdown').css('display')).toBe('none');
    });

    it("Home button should send you to the homepage", function () {
        element('.navlogo').click();
        expect(browser().location().url()).toBe('/home');
    });

    it("Should redirect a logged-out user", function () {
        logout();
        browser().navigateTo('/#/stories');
        expect(browser().location().url()).toBe('/login');
    });

    it("Should be able to change a story name", function () {
        element(".storysettings:eq(0)").click();
        sleep(2);
        input('storyname').enter('test');
        element(".bottomrightbutton").click();
        sleep(2);
        expect(element('.storynameparagraph:eq(0)').text()).toBe('test');
    });

    it("Should be able to open a story", function () {
        expect(repeater('.story').count()).toBeGreaterThan(0);
        element(".editbutton").click();
        sleep(2);
        expect(browser().location().url()).toBe('/editor');
    });

    it("Should be able to open a story's preview", function () {
        element(".viewbutton").click();
        sleep(2);
        expect(browser().location().url()).toBe('/preview');
    });

});

describe('editor', function () {
    beforeEach(function () {
        login();
        element('.editbutton').click();
    });

    afterEach(function () {
        logout();
    });

    var oldSceneCount = -2,
        oldScenarioCount = -2;

    it("is checking the amount of scenes and scenarios", function () {
        element('#scenemenu').query(function (el, done) {
            oldSceneCount = el.children().length;
            done();
        });

        element('#scenarioswrapper').query(function (el, done) {
            oldScenarioCount = el.children().length;
            done();
        });
    });

    it("Can hide and show an asset category", function () {
        expect(element('.assetscontainer:eq(0)').css('display')).toBe('block');
        element(".assetgroupheader:eq(0)").click();
        sleep(1);
        expect(element('.assetscontainer:eq(0)').css('display')).toBe('none');
        element(".assetgroupheader:eq(0)").click();
        sleep(1);
        expect(element('.assetscontainer:eq(0)').css('display')).toBe('block');
    });

    it("Adds a scene when you click the button to add a scene", function () {
        element('#plus').click();
        expect(repeater('.sceneitem').count()).toMatch(oldSceneCount + 1);
    });

    it("Can open the preview page", function () {
        element('#previewbutton').click();
        expect(browser().location().url()).toBe('/preview');
    });

    it("Is able to add a new scenario", function () {
        element("#scenariobutton").click();
        sleep(1);
        element('.newscenariobutton').click();
        sleep(2);
        input('newscenarioname').enter('test');
        element('.bottomrightbutton').click();
        expect(repeater('.scenariowrapper').count()).toBe(oldScenarioCount + 1);
        sleep(1);
        element("#scenariobutton").click();
    });

    it("Should be able to change a story name", function () {
        element(".storysettingsbutton").click();
        sleep(2);
        input('storyname').enter('test');
        element(".bottomrightbutton").click();
        sleep(2);
        expect(element('.storysettingsbutton').text()).toBe('\n            Story: test\n        ');
    });

    it("Shows the scenario dropdown when clicked", function () {
        expect(element('.editorbardropdown').css('display')).toBe('none');
        element("#scenariobutton").click();
        sleep(1);
        expect(element('.editorbardropdown').css('display')).toBe('block');
        element("#scenariobutton").click();
        sleep(1);
        expect(element('.editorbardropdown').css('display')).toBe('none');
    });
});

describe('login', function () {
    beforeEach(function () {
        browser().navigateTo('/#/login');
    });

    it("Recognizes invalid login details and shows an error", function () {
        expect(element('.errormessage').css('display')).toBe('none');
        input('username').enter("onzin124124121j25i1j25125125ioj12");
        input('password').enter("onzina3r23ar32523a5a2");
        element("#loginbutton").click();
        sleep(1);
        expect(element('.errormessage').css('display')).toBe('block');
    });

    it("Recognizes valid login details", function () {
        input('username').enter("testaccount");
        input('password').enter("testtest");
        element("#loginbutton").click();
        sleep(2);
        expect(browser().location().url()).toBe('/stories');
        logout();
    });

});

describe('Registerpage', function () {

    beforeEach(function () {
        browser().navigateTo('/#/register');
        sleep(2);
    });

    it("Should have 31 days and 12 months available", function () {
        expect(repeater('.monthoption').count()).toBe(12);
        expect(repeater('.dayoption').count()).toBe(31);
    });

    it("Should redirect the user if he's already logged in", function () {
        login();
        browser().navigateTo('/#/register');
        sleep(2);
        expect(browser().location().url()).toBe("/stories");
        logout();
    });

    it("Doesn't register you without a valid birthdate", function () {
        input('username').enter('test');
        input("password").enter("testtest");
        input("email").enter("test@test.nl");
        element("#registerbutton").click();
        expect(browser().location().url()).toBe("/register");
    });

    it("Should not redirect the user back", function () {
        expect(browser().location().url()).toBe("/register");
    });

});