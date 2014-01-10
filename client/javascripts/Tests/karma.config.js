module.exports = function(config){
    config.set({
        basePath : '../',

        files : [
            'lib/angular.min.js',
            'lib/angular-animate.min.js',
            'lib/sortable.js',
            'lib/angular-resource.min.js',
            'lib/ui-bootstrap-custom-0.7.0.min.js',
            'lib/ui-bootstrap-custom-tpls-0.7.0.min.js',
            'lib/angular-flash.js',
            'lib/angular-mocks.js',
            'app.js',
            'controllers.js',
            'services.js',
            'directives.js',
            'controllers/editorController.js',
            'Tests/controllers.test.js'

        ],

        exclude : [

        ],

        autoWatch : true,

        frameworks: ['jasmine'],

        browsers : ['Chrome'],

        plugins : [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'
        ],

        junitReporter : {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
