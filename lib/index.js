
/**
 * Module dependencies.
 */





var async = require('async');
var _ = require('underscore');
var path = require('path');
var passport = require('passport');



var default_env_config = {
	env:'local',
    auth_url:'/login',
    register_url:'/register',
    admin_uri:'/admin',
    trigger_uri:'/trigger',
    whoami_uri:'/me',
    illegal_namespaces:[
        'admin',
        'bananas',
        'me',
        'iframe',
        'settings'
    ],
    developers:{
        iframes:[
            { name: 'Account Settings', namespace:"account_settings"},
            { name: 'Super Admin Settings', namespace:"super_admin_settings"}

        ],
		tag_options: [
			{
				name: "Account Integration",
				value: 'account-integration'
			},
			{
				name: "Auth Integration",
				value: 'Auth-integration'
			}
		]
    },
    core:{
        api:{
            prefix:'api.',
            protocol:'https',
            host:'api.localhost:3030'
        }
    },
	comments:{
		uri:'/comments'
	}

}
var njax_util = require('njax-util');
var njax = function(njax_config, env_config){
    var env_config = _.extend(default_env_config, env_config)
	if(!env_config.api && env_config.core.api){
		env_config.api = env_config.core.api;
	}
	env_config.njax_dir = path.join(__dirname, '..');
	var njax_config_loc = path.join(env_config.njax_dir, 'njax_config');
	var default_njax_config = require(njax_config_loc)();
	for(var i in default_njax_config) {
		njax_config[i] = _.extend(default_njax_config[i], njax_config[i]);
	}

    var app = njax_util.app(njax_config, env_config);
	installScript = require(path.join(app.njax.env_config.njax_dir, '/lib/scripts/install'))(app);
	installScript.isInstalled(function(err, is_installed){
		if(err) throw err;
		if(!is_installed){
			 installScript.exec(function(err){
				 if(err) throw err;
				 console.log("!!!!!!INSTALLED!!!!!!");
			 })
		}
	})

	passport.serializeUser(app.model.Account.serializeUser());
	passport.deserializeUser(app.model.Account.deserializeUser());




    app.njax.env_config.njax_tpl_dir = path.join(app.njax.env_config.njax_dir, 'public', 'templates');
    app.locals.partials = {
        _header:app.njax.env_config.njax_util_tpl_dir + '/_header',
        _footer:app.njax.env_config.njax_util_tpl_dir + '/_footer',
        _iframe_parent:app.njax.env_config.njax_tpl_dir + '/_iframe_parent',
		_njax_widget:app.njax.env_config.njax_tpl_dir + '/_widget_meta'
    };
	app.njax.addTemplateDir('');
	app.njax.addAssetDir(path.join(app.njax.env_config.njax_dir, 'public'));
    app.njax.addTemplateDir(app.njax.env_config.njax_tpl_dir);
    require('./modules')(app);

    require('./routes')(app);
    var _start = _.bind(app.start, app);
    app.start = _.bind(function(callback){
        app.njax.cache('super_admins',function(cb){
            var query = {
                $or:[]
            }
            for(var i in app.njax.env_config.super_admin_emails){
                query.$or.push({ email:app.njax.env_config.super_admin_emails[i] });
            }
            app.model.Account.find(query).exec(function(err, accounts){
               if(err) return cb(err);
               return cb(null, accounts);
            });
        }, [], function(err){
            if(err) throw new err;
        });

		app.njax.cache('super_applications',function(cb){
			app.model.Application.find({ level:'SUPER' }).exec(function(err, applications){
				if(err) return cb(err);
				for(var i in applications){
					app.locals[applications[i].namespace + '_www_url'] = applications[i].app_url;
				}

				return cb(null, applications);


			});
		}, [], function(err){
			if(err) throw new err;
		});


		app.njax.widgets.refreshWidgets();

		app.njax.routes.settings.refreshIframes();


        return _start(callback);
    }, app);
    return app;
}
module.exports = njax;



