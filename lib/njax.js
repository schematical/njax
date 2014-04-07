
/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var path = require('path');
var _ = require('underscore');
var serveStatic = require('serve-static');
var bodyParser     = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');


var middleware = require('./routes/middleware');

var config = {
    app_dir:path.join(__dirname, '..', '..'),
    auth_url:'/login',
    register_url:'/register_url',
    mongo:'mongodb://localhost/njax'
}
var njax = function(options){
    njax.config = config= _.extend(config, options);


    var app = express();
    app.njax = njax;
    // all environments
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(config.app_dir, 'public/templates'));
    app.set('view engine', 'hjs');
    var njax_tpl_dir = path.join(__dirname, '..', 'public', 'templates');
    app.locals.partials = {
        _header:njax_tpl_dir + '/_header',
        _footer:njax_tpl_dir + '/_footer'
    };
    app.use(bodyParser());

    if(app.get('env') == 'development'){
        app.use(morgan('dev'));
        app.use(serveStatic(path.join(config.app_dir, 'public')));
        app.locals.asset_url = './';
    }

    app.use(middleware(app));

    app.start = _.bind(njax.start, njax, app);
    njax.init_model(app);
    njax.init_auth(app);

    app.add_partial = _.bind(middleware, app);

    return app;
}
njax.init_auth = function(app){

    var auth = require('./routes/auth');
    auth(app);
 //   var Account = app.model.Account;

}
njax.init_model = function(app){
    mongoose.connect(app.njax.config.mongo);

    app.model = {}
    app.model.Account = require('./model/account');
}
njax.start = function(app){
    http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
}


module.exports = njax;
