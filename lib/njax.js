
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
var njax_cp = require('./modules/child_process/worker_manager');
var njax_broadcast = require('./modules/broadcast');




var middleware = require('./routes/middleware');

var config = {
    app_dir:path.join(__dirname, '..', '..'),
    auth_url:'/login',
    register_url:'/register',
    mongo:'mongodb://localhost/njax',
    admin_uri:'/admin',
    port:3000,
    illegal_namespaces:[
        'admin',
        'bananas'
    ]
}
var njax = function(options){
    njax.config = config= _.extend(config, options);
    if(!njax.config.tmp_dir){
        njax.config.tmp_dir = njax.config.app_dir + '/_tmp';
    }
    if(!njax.config.cache_dir){
        njax.config.cache_dir = njax.config.app_dir + '/_cache';
    }

    var app = express();
    app.njax = njax;
    app.njax.routes = {};//Specal extendable routes

    // all environments
    app.set('port', config.port || 3000);
    app.set('views', path.join(config.app_dir, 'public/templates'));
    app.set('view engine', 'hjs');

    app.use(cookieParser())
    app.use(session({ secret: 'ninja_face', cookie: {  }}))
    app.use(multipart());
    config.njax_dir = path.join(__dirname, '..');
    config.njax_tpl_dir = path.join(config.njax_dir, 'public', 'templates');
    app.locals.partials = {
        _header:config.njax_tpl_dir + '/_header',
        _footer:config.njax_tpl_dir + '/_footer'
    };
    app.use(bodyParser());

    if(app.get('env') == 'development'){
        //APP Specific assets
        app.use(serveStatic(path.join(config.app_dir, 'public')));
        app.locals.asset_url = './';
        app.use(morgan('dev'));


        //NJax Specific
        app.all('/njax/*', function(req, res, next){
            var asset_path = req.path.substr(5);
            var real_asset_path = path.join(config.njax_dir, 'public',asset_path);
            console.log(real_asset_path);
            if(fs.existsSync(real_asset_path)){
                return res.sendfile(real_asset_path);
            }
            return next();
        });
        app.locals.njax_asset_url = '/njax';
    }
    app.use(errorhandler());
    app.use(middleware(app));

    app.start = _.bind(njax._start(app), njax);
    njax.init_model(app);


    njax.init_modules(app);
    njax.init_auth(app);
    njax.init_routes(app);

    app.add_partial = _.bind(middleware, app);

    return app;
}
njax.init_auth = function(app){


    app.use(passport.initialize());
    app.use(passport.session());

    app.use(function(req, res, next){
        //req.session.passport.user = 'mlea@schematical.com';
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

}
njax.init_modules = function(app){
    app.njax.s3 = njaxs3(app);
    app.njax.api = njax_api(app);
    app.njax.cp = njax_cp(app);
    app.njax.broadcast = njax_broadcast(app);
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
  /*  console.error("Missing Partial: " + partial + '.hjs');
    console.error("NJax Path:" + njax_path);
    console.error("Active App Path:" +  active_app_path)*/
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
njax.cachedir = function(file_name /*, ext */){

    if(file_name.toString){
        file_name = file_name.toString();
    }

    return path.join(njax.config.cache_dir, file_name);
}
njax.tmpdir = function(file_name /*, ext */){
    if(!file_name){
        var date = new Date();
        file_name = Math.round(Math.random() * 9999) + '-' + date.getTime();
    }
    if(file_name.toString){
        file_name = file_name.toString();
    }

    return path.join(njax.config.tmp_dir, file_name);
}
njax.isTmpdir = function(file_name /*, ext */){
    if(!file_name){
        var date = new Date();
        file_name = Math.round(Math.random() * 9999) + '-' + date.getTime();
    }
    if(file_name.toString){
        file_name = file_name.toString();
    }

    return njax.config.tmp_dir == file_name.substr(0, njax.config.tmp_dir.length);
}

module.exports = njax;
