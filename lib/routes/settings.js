/**
 This will post forward the iframe settings to a sub app

 */
var async = require('async');
var _ = require('underscore');
module.exports = function(app){

    var route = app.njax.routes.settings = {
        page_iframe:'account_settings',
        middleware:function(page_iframe){
            return function(req, res, next){
                //This needs to load all apps with settings
                //TODO: Prioritize and optimize this query
                app.model.Application.find({}).exec(function(err, applications){
                    if(err) return next(err);
                    var tabs = [];
                    for(var i in applications){
                        if(applications[i].iframes && applications[i].iframes[page_iframe] && applications[i].iframes[page_iframe].url.length > 1){
                            tabs.push({
                                name: applications[i].name,
                                namespace:applications[i].namespace
                            })
                        }
                    }
                    res.bootstrap('tabs', tabs);
                    return next();
                });

            }
        },
        route:function(page_iframe){
            if(!page_iframe){
                page_iframe = route.page_iframe;
            }
            return [
                route.middleware(page_iframe),
                route.middleware_iframe_parent(page_iframe),
                function(req, res, next){
                    res.render('settings/index');
                }
            ]

        },

        init:function(settings_uri){
            if(!settings_uri){
                settings_uri = '/settings';
            }
            app.param('page_iframe', function(req, res, next, id){
                if(!_.isUndefined(id)){
                    req.page_iframe = id;
                }
                return next();
            });
            app.all(settings_uri + '*', function(req, res, next){
                if(!req.user && !req.query.forgot_pass_code){
                    return next(404);
                }
                if(!req.user && req.query.forgot_pass_code && req.query.forgot_pass_code.length > 3){
                    //Query user by code
                    return app.model.Account.findOne({ forgot_pass_code: req.query.forgot_pass_code}).exec(function(err, account){
                        if(err) return next(err);
                        if(!account){
                            return next(404);
                        }
                        res.bootstrap('user', account);
                        res.locals.forgot_pass = (req.query.forgot_pass_code && req.user.forgot_pass_code == req.query.forgot_pass_code);
                        res.locals.forgot_pass_code = req.query.forgot_pass_code;
                        return next();
                    });
                }
                return next();
            });
            app.locals.partials._settings_basic = 'settings/_basic';
            app.all(settings_uri, app.njax.routes.settings.route_basic());
            app.all(settings_uri + '/reset_pass', app.njax.routes.settings.route_reset_pass());


            app.all(settings_uri + '/:application', app.njax.routes.settings.route());
            app.all('/iframe/:page_iframe/:application', app.njax.routes.settings.route_iframe());


        },
        route_iframe:function(page_iframe){

            return function(req, res, next){
                if(!page_iframe){
                    page_iframe = req.page_iframe || route.page_iframe;
                }

                if(!req.application){
                    return next(new Error("No application found"));
                }

                if(!req.application.iframes || !req.application.iframes[page_iframe]){
                    return next(new Error("This application does not have an iframe url for this page"));
                }
                res.bootstrap('iframe_url', req.application.iframes[page_iframe].url);
                var payload = _.clone(res._bootstrap);
                delete(payload['active_application']);
                res.bootstrap('njax_payload', JSON.stringify(payload));
                res.render('iframe');
            }
        },
        middleware_iframe_parent:function(page_iframe){
            if(!page_iframe){
                page_iframe = route.page_iframe;
            }
            return function(req, res, next){
                //Take the bootstrap
                if(!req.application){
                    return next(new Error("No application found"));
                }
                if(!req.application.iframes || !req.application.iframes[page_iframe]){
                    return next(new Error("This application does not have an iframe url for this page"))
                }

                //Set up the template too
                res.locals.iframe_url = '/iframe/' + page_iframe + '/' + req.application.namespace;

                return next();
            }
        },
        route_basic:function(){
            route.page_iframe
            return [
                route.middleware(route.page_iframe),
                function(req, res, next){
                    res.locals.display_basic_settings = true;
                    res.render('settings/index');
                }
            ]
        },
        route_reset_pass:function(){
            return [
                route.middleware(route.page_iframe),
                function(req, res, next){
                    if((req.query.forgot_pass_code && req.user.forgot_pass_code == req.query.forgot_pass_code)){
                        return next();
                    }
                    if(!req.body.password){
                        return res.redirect('/settings');
                    }
                    res.locals.display_basic_settings = true;
                    return req.user.authenticate(req.body.old_password, function(err, success){
                        if(err) return next(err);
                        if(!success){
                            return next(new Error("Old password does not match"));
                        }
                        return next();
                    });
                },
                function(req, res, next){
                    if((req.body.password.length < 6)){
                        return next(new Error("Password not long enough"));
                    }
                    if(req.body.password != req.body.password_confirm){
                        return next(new Error("New Passwords Do Not Match"));
                    }
                    req.user.forgot_pass_code = null;
                    return req.user.setPassword(req.body.password, function(err){
                        if(err) return next(err);
                        return req.user.save(function(err){
                            if(err) return next(err);
                            res.locals.success = true;
                            return next();
                        })
                    });
                },
                function(err, req, res, next){
                    res.locals.error = err;
                    return next();
                },
                function(req, res, next){
                    return res.render('settings/index')
                }
            ];

        }
    }
}