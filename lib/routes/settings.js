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
                    res.render('settings');
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
            app.all(settings_uri, app.njax.routes.settings.route());
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
        }
    }
}