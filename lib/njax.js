
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
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var multipart = require('connect-multiparty');
var errorhandler = require('errorhandler');
var njaxs3 = require('./modules/s3');




var middleware = require('./routes/middleware');

var config = {
    app_dir:path.join(__dirname, '..', '..'),
    auth_url:'/login',
    register_url:'/register',
    mongo:'mongodb://localhost/njax',
    port:3000
}
var njax = function(options){
    njax.config = config= _.extend(config, options);


    var app = express();
    app.njax = njax;
    // all environments
    app.set('port', config.port || 3000);
    app.set('views', path.join(config.app_dir, 'public/templates'));
    app.set('view engine', 'hjs');

    app.use(cookieParser())
    app.use(session({ secret: 'keyboard cat', cookie: {  }}))
    app.use(multipart());
    var njax_tpl_dir = path.join(__dirname, '..', 'public', 'templates');
    app.locals.partials = {
        _header:njax_tpl_dir + '/_header',
        _footer:njax_tpl_dir + '/_footer'
    };
    app.use(bodyParser());

    if(app.get('env') == 'development'){

        app.use(serveStatic(path.join(config.app_dir, 'public')));
        app.locals.asset_url = './';
        app.use(morgan('dev'));
    }
    app.use(errorhandler());
    app.use(middleware(app));

    app.start = _.bind(njax.start, njax, app);
    njax.init_model(app);
    njax.init_auth(app);
    njax.init_s3(app);
    app.add_partial = _.bind(middleware, app);

    return app;
}
njax.init_auth = function(app){


    app.use(passport.initialize());
    app.use(passport.session());
    app.use(function(req, res, next){
        console.log(req.session.passport);
        if(req.user){
            res.locals.user = req.user.toObject();
        }
        return next();
    })

    var auth = require('./routes/auth');
    auth(app);

}
njax.init_model = function(app){
    mongoose.connect(app.njax.config.mongo);

    app.model = {}
    app.model.Account = require('./model/account')(app);
}
njax.init_s3 = function(app){
    app.njax.s3 = njaxs3(app);
}

njax.start = function(app){


    app.use(function(req, res, next){
        console.log("404 Hit");
        res.send(404, 'Sorry cant find that!');
    });
    http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
}


module.exports = njax;
