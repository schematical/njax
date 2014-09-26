
/**
 * Module dependencies.
 */





var async = require('async');
var _ = require('underscore');
var path = require('path');


var config = {
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

        ]
    },
    core:{
        api:{
            prefix:'api.',
            protocol:'https',
            host:'api.localhost:3030'
        }
    }

}
var njax_util = require('njax-util');
var njax = function(options){
    options = _.extend(config, options)

    var app = njax_util.app(options);
    if(!app.njax.config.api && app.njax.config.core.api){
        app.njax.config.core.api = app.njax.config.api;
    }
    app.njax.config.njax_dir = path.join(__dirname, '..');

    app.njax.config.njax_tpl_dir = path.join(app.njax.config.njax_dir, 'public', 'templates');
    app.locals.partials = {
        _header:app.njax.config.njax_util_tpl_dir + '/_header',
        _footer:app.njax.config.njax_util_tpl_dir + '/_footer',
        _iframe_parent:app.njax.config.njax_tpl_dir + '/_iframe_parent'
    };
    app.njax.addTemplateDir(app.njax.config.njax_tpl_dir);
    require('./modules')(app);

    require('./routes')(app);
    var _start = _.bind(app.start, app);
    app.start = _.bind(function(){
        app.njax.cache('super_admins',function(cb){
            var query = {
                $or:[]
            }
            for(var i in app.njax.config.super_admin_emails){
                query.$or.push({ email:app.njax.config.super_admin_emails[i] });
            }
            app.model.Account.find(query).exec(function(err, accounts){
               if(err) return cb(err);
               return cb(null, accounts);
            });
        }, [], function(err){
            if(err) throw new err;
        });
        _start();
    }, app);
    return app;
}
module.exports = njax;



