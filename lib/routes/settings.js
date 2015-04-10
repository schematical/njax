/**
 This will post forward the iframe settings to a sub app

 */
var async = require('async');
var _ = require('underscore');
module.exports = function(app){

    var route = app.njax.routes.settings = {
        page_iframe:'account_settings',
		_iframe_cache:null,
		/**
		 * This loads all of the iframe data and orders them type for quick access
		 */
		refreshIframes:function(cb){
			return app.model.Application.find({}).exec(function(err, applications){
				if(err) return next(err);
				var tabs = [];
				var _iframe_cache = {};
				for(var i in applications){
					/* if(applications[i].iframes && applications[i].iframes[page_iframe] && applications[i].iframes[page_iframe].url && applications[i].iframes[page_iframe].url.length > 1){
					 tabs.push({
					 name: applications[i].name,
					 namespace:applications[i].namespace
					 })
					 }*/
					for(var ii in applications[i].iframes){
						var iframe = applications[i].iframes[ii]

						iframe.application = applications[i].namespace;


						if(!_iframe_cache[iframe.iframe_type]){
							_iframe_cache[iframe.iframe_type] = {};
						}
						var weight_found = false;
						if(!iframe.weight){
							iframe.weight = 100;
						}
						while(weight_found){
							if(!_iframe_cache[iframe.iframe_type][iframe.weight]){
								weight_found = true;
							}else{
								iframe.weight += 1;
							}
						}
						_iframe_cache[iframe.iframe_type][iframe.weight] = iframe;

					}
				}
				app.njax.routes.settings._iframe_cache = {};
				for(var i in _iframe_cache){
					var sorted = _.sortBy(_iframe_cache[i], function(num){ return num; });

					app.njax.routes.settings._iframe_cache[i] = sorted;
				}

				if(cb)return cb()
			});
		},
        middleware:function(page_iframe){
            return function(req, res, next){
                //TODO: This needs too add subscribed to tabs as well eventually, 3rd party stuff

				res.bootstrap('tabs', app.njax.routes.settings._iframe_cache[page_iframe]);
				return next();
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
            app.all('/iframe/:page_iframe/:application/:tab', app.njax.routes.settings.route_iframe());
			app.param('tab', route.populate);


        },
		populate:function(req, res, next, id){
			req.njax.tab_id = id;
			return next();
		},

        route_iframe:function(default_page_iframe){

            return function(req, res, next){

				var page_iframe = default_page_iframe ||req.page_iframe || route.page_iframe;


                if(!req.application){
                    return next(new Error("No application found"));
                }

                if(!req.application.iframes || !req.application.iframes[req.njax.tab_id]){
                    return next(new Error("This application does not have an iframe url for this page"));
                }
                res.bootstrap('iframe_url', req.application.iframes[req.njax.tab_id].url);

                var payload = _.clone(res._bootstrap);
				/*var njax_payload = JSON.stringify(payload);
				njax_payload = app.njax.crypto.encrypt(njax_payload, req.active_application.secret);
				res.bootstrap('njax_payload', njax_payload);
				delete(payload['active_application']);*/
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

                if(!req.application.iframes || !req.application.iframes[req.njax.tab_id]){
                    return next(new Error("This application does not have an iframe url for this page"))
                }
				if(req.application.iframes[req.njax.tab_id].iframe_type != page_iframe){
					return next(new Error("This application does not have an iframe url for this page #2"))
				}

                //Set up the template too
                res.locals.iframe_url = '/iframe/' + page_iframe + '/' + req.application.namespace + '/' + req.njax.tab_id;
				var payload = _.clone(res._bootstrap);
				var njax_payload = JSON.stringify(payload);
				njax_payload = app.njax.crypto.encrypt(njax_payload, req.application.secret);
				res.bootstrap('njax_payload', njax_payload);
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
                    return res.redirect(app.njax.config.auth_url + '?email=' + req.user.email);
                    //return res.render('settings/index')
                }
            ];

        }
    }
}