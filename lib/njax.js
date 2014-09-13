
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
    whoami_uri:'/me',
    illegal_namespaces:[
        'admin',
        'bananas',
        'me',
        'iframe'
    ]
}
var njax_util = require('njax-util');
var njax = function(options){
    options = _.extend(config, options)

    var app = njax_util.app(options);
    app.njax.config.njax_dir = path.join(__dirname, '..');

    app.njax.config.njax_tpl_dir = path.join(app.njax.config.njax_dir, 'public', 'templates');
    app.locals.partials = {
        _header:app.njax.config.njax_util_tpl_dir + '/_header',
        _footer:app.njax.config.njax_util_tpl_dir + '/_footer'
    };
    require('./modules')(app);

    require('./routes')(app);

    return app;
}
module.exports = njax;



