var oauth2orize = require('oauth2orize');
var async = require('async');
var _ = require('underscore');
module.exports = function(app){
    var njax_api =  {
        server:null,
        init:function(app){
            var server = this.server = oauth2orize.createServer();
            server.grant(oauth2orize.grant.code(function(application, redirect_uri, account, ares, done) {
                var code = njax_api.uid(16)

                var requestCode = new app.model.RequestCode({
                    application:application._id,
                    code:code,
                    redirect_uri:redirect_uri,
                    account:account._id
                });
                requestCode.save(function(err) {
                    if (err) { return done(err); }
                    done(null, code);
                });
            }));

            server.exchange(oauth2orize.exchange.code(function(application, code, redirect_uri, done) {
                var token = null;
                var requestCode = null;
                var accessToken = null;
                async.series([
                    function(cb){
                        app.model.RequestCode.find({ application: application._id, code:code }, function(err, _requestCode) {
                            var requestCode = _requestCode;

                            if (err) { return done(err); }
                            if (requestCode === undefined) { return done(null, false); }
                            if (application._id !== requestCode.application) { return done(null, false); }
                            if (redirect_uri !== requestCode.redirect_uri) { return done(null, false); }
                            return cb();
                        });
                    },
                    function(cb){
                        return njax_api.create_token(
                            requestCode.account,
                            requestCode.application,
                            function(err, _token, accessToken){
                                if(err) return next(err);
                                token = _token;
                                return cb();
                            }
                        );
                    },
                    function(cb){
                        return requestCode.remove(function(err) {
                            if(err) { return done(err); }
                            return done(null, token);


                        });
                    },
                ]);
            }));
            app.use(njax_api.middleware());
            njax_api.route('/oauth');


        },
        route:function(uri){
            var server = this.server;
            app.get(
                uri,
                function(req, res, next){
                    if(!req.user) return res.send(404);
                    return next();
                },
                server.authorize(function(client_id, redirect_uri, done) {
                    app.model.Application.findOne({ namespace: client_id}, function(err, application) {
                        if (err) { return done(err); }
                        if (!application) { return done(null, false); }
                        //if (!_.contains(application.redirect_uris, redirect_uri)) { return done(null, false); }
                        return done(null, application, redirect_uri);
                    });
                }),
                function(req, res) {
                    res.render('njax/oauth/dialog',
                        {
                            auth_root_uri:uri,
                            transactionID: req.oauth2.transactionID,
                            //user: req.user,
                            application: req.oauth2.client
                        }
                    );
                }
            );


            app.post(
                uri + '/decision',
                function(req, res, next){
                    if(!req.user) return res.send(404);
                    return next();
                },
                server.decision()
            );
            server.serializeClient(function(application, done) {
                return done(null, application.namespace);
            });

            server.deserializeClient(function(id, done) {
                app.model.Application.findOne({ namespace: id }, function(err, application) {
                    if (err) { return done(err); }
                    return done(null, application);
                });
            });
        },

        middleware:function(){
            return function(req, res, next){

                //Authenticate
                var client_id =
                        req.headers.client_id ||
                        req.body.client_id ||
                        req.query.client_id ||
                        req.cookies.client_id;
                var client_secret =
                    req.headers.client_secret ||
                        req.body.client_secret ||
                        req.query.client_secret ||
                        req.cookies.client_secret;
                var access_token =
                    req.headers.access_token ||
                        req.body.access_token ||
                        req.query.access_token ||
                        req.cookies.access_token;

                if(access_token =='undefined'){
                    access_token = null;
                }

                var application = null;
                async.series([
                    function(cb){
                        return njax_api.init_super_apps(app, cb);
                    },
                    function(cb){
						res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
						res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,access_token,client_id,client_secret');
						res.setHeader('Access-Control-Allow-Credentials', true);

                       /* res.setHeader('Access-Control-Allow-Origin', '*');
						return cb();*/

                        var api_url = req.api_url.replace('http://', '').replace('https://', '');
                        var www_url = req.www_url.replace('http://', '').replace('https://', '');
                        //TODO: Might dynamically load this based on client_id, etc
                        var allow_origin = null;
                        var raw_origin = req.get('Origin');

                        var origin = raw_origin && raw_origin.replace('http://', '').replace('https://', '');
						req.njax.origin = origin;
						if(!origin){
                            allow_origin = api_url;
                        }else if(origin == api_url){
                            allow_origin = api_url;
                        }else if(origin == www_url){
                            allow_origin = www_url;
                        }else{
                            for(var i in app.njax.cache.super_applications){
                                if(app.njax.cache.super_applications[i].domain == origin){
									res.bootstrap('active_application', app.njax.cache.super_applications[i]);
                                    allow_origin = app.njax.cache.super_applications[i].domain;
                                }
                            }
                        }
						function finish(err){
							if(err){
								return next(err);
							}
							//console.log('Protocol:', req.njax.protocol + '://' + allow_origin);
							res.setHeader('Access-Control-Allow-Origin', req.njax.protocol + '://' + origin);

							if(req.method == 'OPTIONS'){
								return res.send('yep');
							}
							return cb()
						}
                        if(!allow_origin){
							return app.njax.routes.origin_middleware(req, res, finish);
                        }
						return finish();

                    },
                    function(cb){
                        //console.log("ClientID:", client_id, client_secret, access_token);

                        if(_.isUndefined(client_id) || client_id == 'undefined'){

                            client_id = app.njax.config.core.app;

                        }
                        return app.model.Application.findOne(
                            {
                                namespace:client_id
                            },
                            function(err, _application){
                                if(err) return next(err);

                                application = _application;
                                return cb();
                            }
                        );
                    },
                    function(cb){
                        if(!client_secret){
                            return cb();
                        }
                        if(!access_token && application && application.secret != client_secret){
                            return next(new Error("Invalid Client Secret"));
                        }
                        res.bootstrap('active_application', application);
                        if(application && application.level == 'SUPER' && access_token){
                            return app.model.Account.findOne({
                                namespace:access_token
                            }).exec(function(err, account){
                                if(err) return next(err);
                                if(!account){
                                    return cb();
                                }
                                req.user = account;
								return cb();
                            });
                        }
                        return cb();
                    },
                    function(cb){
                        if(req.user){
                            return cb();
                        }
                        if(!application){
                            console.error("Unable to find application");
                            return cb();
                        }
                        if(!access_token){
                            return next();
                        }
                        var query =  {
                            application:application._id,
                            token: access_token
                        }
                        return app.model.AccessToken.findOne(
                           query
                        ).populate('account')
                        .exec(
                            function(err, access_token){
                                if(err) return next(err);
                                if(!access_token) return next();//new Error("No access token found"));
                                //req._application = application;
                                res.bootstrap('active_application', application);
                                res.bootstrap('user', access_token.account);

                                return cb();
                            }
                        );
                    },
                    function(cb){
                        return next();
                    }

                ]);
            }

        },
        create_token:function(account, application, callback){
            if(_.isObject(account)){
                account = account._id;
            }
            if(_.isObject(application)){
                application = application._id;
            }
            async.series([
                function(cb){
                    if(!_.isString(application)){
                        return cb();
                    }
                    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
                    if(checkForHexRegExp.test(application)){
                        return cb();
                    }
                    //Assume it is a namespace
                    app.model.Application.findOne({ namespace: application }).exec(function(err, _application){
                        if(err) return callback(err);
                        if(!_application){
                            return callback(new Error("No application with namespace: " + application));
                        }
                        application = _application._id;
                        return cb();
                    });
                }
            ],
            function(){
                //end async
                var token = njax_api.uid(256);
                var accessToken = new app.model.AccessToken({
                    token:token,
                    account:account,
                    application: application
                });
                return accessToken.save( function(err) {
                    if (err) { return callback(err); }
                    return callback(null, token, accessToken);
                });
            });



        },
        uid:function(len) {
            var buf = []
                , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
                , charlen = chars.length;

            for (var i = 0; i < len; ++i) {
                buf.push(chars[njax_api.getRandomInt(0, charlen - 1)]);
            }

            return buf.join('');
        },

        /**
         * Return a random int, used by `utils.uid()`
         *
         * @param {Number} min
         * @param {Number} max
         * @return {Number}
         * @api private
         */

        getRandomInt:function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        init_super_apps:function(app, next){
            return next();//This got moved into index
        }

    }

    njax_api.init(app);

    return njax_api;
}