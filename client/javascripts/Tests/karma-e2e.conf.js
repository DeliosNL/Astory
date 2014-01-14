module.exports = function(config){
    config.set({

        files : [
            'scenarios.js'
        ],

        autoWatch : false,

        browsers : ['Chrome'],

        frameworks: ['ng-scenario'],

        singleRun : true,

        proxies : {
            '/': 'http://localhost:8500/'
        },

        urlRoot : '/karma/',

        plugins : [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-ng-scenario',
            'karma-phantomjs-launcher'
        ],

        junitReporter : {
            outputFile: 'test_out/e2e.xml',
            suite: 'e2e'
        }

    });
}