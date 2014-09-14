/**
 This will post forward the iframe settings to a sub app

 */
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
                        if(applications[i].iframes && applications[i].iframes[page_iframe]){
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
                function(req, res, next){
                    res.render('settings');
                }
            ]

        },
        init:function(settings_uri){
            if(!settings_uri){
                settings_uri = '/settings';
            }
            app.all(settings_uri, app.njax.routes.settings.route());
            app.all(settings_uri + '/:application', app.njax.routes.settings.route());
            app.all('/iframe/:application', app.njax.routes.settings.route_iframe());
        },
        route_iframe:function(page_iframe){
            if(!page_iframe){
                page_iframe = route.page_iframe;
            }
            return function(req, res, next){

                if(!req.application){
                    return next(new Error("No application found"));
                }

                if(!req.application.iframes || !req.application.iframes[page_iframe]){
                    return next(new Error("This application does not have an iframe url for this page"));
                }
                res.bootstrap('iframe_url', req.application.iframes[page_iframe].url);
                res.bootstrap('njax_payload', JSON.stringify(res._bootstrap));
                res.render('iframe');
            }
        },
        middleware_iframe_parent:function(iframe_page){
            return function(req, res, next){
                //Take the bootstrap
                if(!req.application){
                    return next(new Error("No application found"));
                }
                if(!req.application.iframes || !req.application.iframes[iframe_page]){
                    return next(new Error("This application does not have an iframe url for this page"))
                }

                //Set up the template too
                res.locals.iframe_url = '/iframe/'+ req.application.namespace;
                return iframe_page;
            }
        }
    }
}