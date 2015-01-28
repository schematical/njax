var async = require('async');
var _ = require('underscore');
var path = require('path');
var fs = require('fs');


module.exports = function(app){
    var route = app.njax.routes.util = {
        init:function(){
			//Make sure they exist
			for(var i in app.njax.config.angular_sdk.modules){
				var module_path = app.njax.config.angular_sdk.modules[i];
				var full_module_path = /*path.join(app.njax.config.app_dir,*/ module_path/*)*/;
				if(!fs.existsSync(full_module_path)){
					throw new Error(full_module_path + ' doesn\'t exist');
				}
			}


            app.all(
                app.njax.config.whoami_uri,
                route.whoami
            );

            app.all(
                '/sdk.js',
                function(req, res, next){
                    req.njax.call_type = 'www';
					res.set('Content-Type: application/javascript');
					var sdk_bootstrap = {
						cookie: res._bootstrap.cookie,
						core_api_url: req.core_api_url,
						modules:app.njax.config.angular_sdk.modules
					}
					res.locals.sdk_bootstrap = JSON.stringify(sdk_bootstrap);
					var angular_modules = '\n\n';
					for(var i in app.njax.config.angular_sdk.modules){
						var module_path = app.njax.config.angular_sdk.modules[i];
						var full_module_path = module_path;//path.join(/*app.njax.config.app_dir,*/ module_path);
						angular_modules += fs.readFileSync(full_module_path).toString() + '\n\n';
					}
					res.locals.angular_modules = angular_modules;

                    res.render('sdk');
                }
            );
			app.all(
				'/bootstrap',
				function(req, res, next){
					req.njax.call_type = 'api';
					res.render('bootstrap', res._bootstrap);
				}
			);
        },
        whoami:function(req, res, next){
			var user = null;
			if(req.user){
				user =  req.user.toObject()
				user.access_token = req.cookies.access_token;
			}
			return res.render('me', { user: user });
        }
    }
    return route;

}