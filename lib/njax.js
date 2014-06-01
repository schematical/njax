
/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var fs = require('fs');
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
var njax_api = require('./modules/api');



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

    app.njax.routes = {};//Specal extendable routes
    var app = express();
    app.njax = njax;
    // all environments
    app.set('port', config.port || 3000);
    app.set('views', path.join(config.app_dir, 'public/templates'));
    app.set('view engine', 'hjs');

    app.use(cookieParser())
    app.use(session({ secret: 'ninja_face', cookie: {  }}))
    app.use(multipart());
    config.njax_tpl_dir = path.join(__dirname, '..', 'public', 'templates');
    app.locals.partials = {
        _header:config.njax_tpl_dir + '/_header',
        _footer:config.njax_tpl_dir + '/_footer'
    };
    app.use(bodyParser());

    if(app.get('env') == 'development'){

        app.use(serveStatic(path.join(config.app_dir, 'public')));
        app.locals.asset_url = './';
        app.use(morgan('dev'));
    }
    app.use(errorhandler());
    app.use(middleware(app));

    app.start = _.bind(njax._start(app), njax);
    njax.init_model(app);
    njax.init_auth(app);

    njax.init_modules(app);
    njax.init_routes(app);
    app.add_partial = _.bind(middleware, app);

    return app;
}
njax.init_auth = function(app){


    app.use(passport.initialize());
    app.use(passport.session());

    app.use(function(req, res, next){
        req.session.passport.user = 'mlea@schematical.com';
        //console.log(req.session.passport);
        if(req.user){
            res.locals.user = req.user.toObject();
        }
        return next();
    })

    var auth = require('./routes/auth');
    auth(app);

}
njax.init_model = function(app){
    app.mongoose = mongoose;
    app.mongoose.connect(app.njax.config.mongo);

    app.model = {}
    app.model.Account = require('./model/account')(app);
    app.model.Application = require('./model/application')(app);
    app.model.AccessToken = require('./model/accessToken')(app);
    app.model.RequestCode = require('./model/requestCode')(app);
}
njax.init_modules = function(app){
    app.njax.s3 = njaxs3(app);
    app.njax.api = njax_api(app);

}
njax.init_routes = function(app){

    var index = require('./routes');
    index(app);
}
njax.setup_partials = function(partial){
    if(fs.existsSync( partial + '.hjs')){
        return partial;
    }
    var active_app_path = path.join(config.app_dir, 'public', 'templates', partial)+ '.hjs';
    if(fs.existsSync(active_app_path)){
        return partial;
    }


    var njax_path = path.join(config.njax_tpl_dir, partial) + '.hjs';

    if(fs.existsSync(njax_path)){
        return njax_path;
    }
    console.error("Missing Partial: " + partial + '.hjs');
    console.error("NJax Path:" + njax_path);
    console.error("Active App Path:" +  active_app_path)
    return partial;


}


njax._start = function(app){
    return function(options, callback){
        if(!callback && _.isFunction(options)){
            callback = options;
        }
        for(var i in app.locals.partials){
            app.locals.partials[i] = njax.setup_partials(app.locals.partials[i]);
        }

        app.use(function(req, res, next){
            console.log("404 Hit");
            res.send(404, 'Sorry cant find that!');
        });
        var server = http.createServer(app);
        server.listen(app.get('port'), function(){
            console.log('Express server listening on port ' + app.get('port'));
            if(callback){
                return callback(null, app, server);
            }
        });
    }
}


module.exports = njax;
