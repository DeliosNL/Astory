/**
 * Created by theotheu on 27-10-13.
 */

/**
 * Module dependencies.
 */
var express = require('express'),
    fs = require('fs'),
    http = require('http'),
    path = require('path');

// Load configuration
var env = process.env.NODE_ENV || 'development',
    config = require('./config/config.js')[env];

// Bootstrap db connection
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
mongoose.connect(config.db);

// Bootstrap models
var models_path = __dirname + '/app/models'
    , model_files = fs.readdirSync(models_path);
model_files.forEach(function (file) {
    require(models_path + '/' + file);
});


//Passport
var passport = require('passport');
require('./config/passport')(passport, config);


var app = express();
app.configure(function () {
    app.use(express.static('public'));
    app.use(express.cookieParser());
    app.use(express.bodyParser({uploadDir: './client/images'}));
    app.use(express.session({ secret: '2kool4skool' }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);

    app.set('port', process.env.PORT || config.port);
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, './app/views/'));
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(require('stylus').middleware(__dirname + '../client'));
    app.use(express.static(path.join(__dirname, '../client')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

// Bootstrap http server
http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

// Bootstrap routes
var routes_path = __dirname + '/routes'
    , route_files = fs.readdirSync(routes_path);
route_files.forEach(function (file) {
    require(routes_path + '/' + file)(app);
})

// Last line to serve static page
console.log('last resort');
app.use(express.static(__dirname + '../client/'));
