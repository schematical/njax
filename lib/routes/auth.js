var async = require('async');
var _ = require('underscore');
/*
 * GET users listing.
 */
var passport = require('passport');
module.exports = function(app){
    var route = app.njax.routes.auth = {
        redirect_url:'/',
        auth_error:new Error("Not a valid email/password combination"),
        init:function(){

            //If Access Token Exists use it
            app.use(function(req, res, next){
                async.series([
                    /*function(cb){
                        //return next();
                        if(!req.cookies['access_token'] &&  req.user){
                            //Create an access token for it
                            return app.njax.api.create_token(req.user, app.njax.config.core_app, function(err, access_token){
                                if(err) return next(err);
                                res.cookie('access_token', access_token, app.njax.config.cookie);
                                return cb();
                            });
                        }
                        return cb();
                    },*/
                    function(cb){
                        if(req.user && req.cookies['access_token']){
                            res.bootstrap('access_token', req.cookies['access_token']);
                        }
                        return cb();
                    },
                    /* THIS DETERMINS IF THE USER IS A SUPER ADMIN */
                    function(cb){



                        if(req.user && app.njax.config.super_admin_emails && _.contains(app.njax.config.super_admin_emails, req.user.email)){
                            res.bootstrap('is_admin', true);
                        }
                        return cb();
                    }
                ],
                function(){
                    //end async
                    return next();
                });

            });


            app.get(app.njax.config.register_url, function(req, res) {
                res.render('register', { });
            });

            app.post(
                app.njax.config.register_url,
                [
                    route.validate_register,
                    route.pre_register,
                    route.register,
                    route.post_register,
                    route.broadcast_register,
                    route.render_register
                ]
            );


            app.post(
                app.njax.config.auth_url,
                [
                    route.pre_auth,
                    route.auth,
                    route.post_auth,
                    route.auth_error_check,
                    route.render_auth_success
                ]
            );
            app.get(
                app.njax.config.auth_url,
                [
                    function(req, res, next){
                        if(req.query.email){
                            res.bootstrap('email', req.query.email);
                        }
                        return next();
                    },
                    route.render_auth
                ]
            )

            app.get(
                '/logout',
                [
                    route.pre_logout,
                    route.logout,
                    route.post_logout
                ]
            );

            app.get(
                '/whoami',
                [
                    //route.pre_whoami,
                    route.whoami
                    //route.post_whoami
                ]
            );
            app.get('/forgot_pass', function(req, res, next){
                res.render('forgot_pass');
            });
            app.post('/forgot_pass', [
                function(req, res, next){
                    var account = null;
                    var forgot_pass_code = null;
                        //Load the user
                    async.series([
                        function(cb){
                            app.model.Account.findOne({ email: req.body.email }).exec(function(err, _account){
                                if(err) return next(err);
                                account = _account;
                                if(!account){
                                    return next(new Error("No user with that account"));//TODO: Probablly hide this message
                                }
                                return cb();
                            });
                        },
                        function(cb){
                            forgot_pass_code = app.njax.api.uid(24);
                            account.forgot_pass_code = forgot_pass_code;
                            account.save(function(err){
                                if(err) return next(err);
                                return cb();
                            });
                        },
                        function(cb){
                            app.njax.broadcast(
                                [ account ],
                                'auth.forgot.pass',
                                {
                                    core_www_url:req.www_url,
                                    forgot_pass_code: forgot_pass_code
                                }
                            );
                            return cb();
                        }
                    ],
                    function(){
                        //end async
                        res.render('forgot_pass');
                    });



                }
            ]);

        },
      /*  auth://function(req, res, next){
            passport.authenticate('local', {
                successRedirect: '/',
                failureRedirect: '/login?error',
                failureFlash: true
            }),//;
        //},*/
        auth:function(req, res, next){
            res.bootstrap('redirect_url', req.query.redirect || route.redirect_url);
            var email = req.body.username || req.body.email;
            if(!email){
                res.bootstrap('error', new Error('Must submit an email address'));
                return next();
            }
            if(!req.body.password){
                res.bootstrap('error', new Error('Must submit an password'));
                return next();
            }
            var account = null;
            async.series([
                function(cb){
                    return app.model.Account.findOne({ email: email}).exec(function(err, _account){
                        if(err) return next(err);
                        account = _account;
                        if(!account){
                            return next(route.auth_error);
                        }
                        return cb();
                    });
                },
                function(cb){
                    account.authenticate(req.body.password, function(err, success){
                        if(err) return next(err);
                        if(!success){
                            return next(route.auth_error);
                        }

                        return cb();
                    })
                },
                function(cb){
                    req.login(account, function(err) {
                        if (err) { return next(err); }
                        res.bootstrap('user', account);
                        return cb();
                    });
                },
                function(cb){
                    return app.njax.api.create_token(req.user, app.njax.config.core.app, function(err, access_token){
                        if(err) return next(err);
                        res.cookie('access_token', access_token, app.njax.config.cookie);
                        return cb();
                    });
                }
            ],
            function(){
                //end async
                return next();
            });


        },
        render_auth:function(req, res, next){
            res.bootstrap('redirect_url', req.query.redirect || route.redirect_url);
            res.render('auth');
        },
        pre_auth:function(req, res, next){
            return next();
        },
        post_auth:function(req, res, next){
            return next();
        },
        auth_error_check:function(err, req, res, next){
            if(!err){
                return next();
            }
            if(req.njax.call_type == 'api'){
                return next();
            }
            res.bootstrap('error', err);
            res.render('auth');
        },
        render_auth_success:function(req, res, next){
            if(req.njax.call_type == 'api'){
                return res.render('auth', req.user.toObject());
            }
            var redirect_url = req.query.redirect || route.redirect_uri;
            //TODO: Check domain

            return res.redirect(redirect_url);
        },
        pre_logout:function(req, res, next){
            return next();
        },
        logout:function(req, res, next) {
            res.clearCookie('access_token');
            req.session.destroy();
            req.logout();
            return next();
        },
        post_logout:function(req, res, next){

            res.redirect('/');
        },
        pre_register:function(req, res, next){
            return next();
        },
        validate_register:function(req, res, next){
            if(_.contains(app.njax.config.illegal_namespaces, req.body.namespace)){
                return next(new Error('"' + req.body.namespace + '" is an invalid username(namespace)'));
            }
            if(!req.body.password || req.body.password.length < 6 || req.body.password == req.body.password_confim){
                return next(new Error("Invalid Passwords"));
            }
            //TODO: Add email validation and P1, p2
            return next();
        },
        register:function(req, res, next) {
            if(!req.body.username &&  req.body.email){
                req.body.username =  req.body.email;
            }
            var Account =  app.model.Account;
            var user = new Account({
                email : req.body.username || req.body.email,
                namespace: req.body.namespace,
                name: req.body.name
            });

            Account.register(user, req.body.password, function(err, account) {
                if (err) {
                    console.log(err);
                    return res.render(
                        'register',
                        {
                            account : account,
                            error:err,
                            email : req.body.username,
                            namespace: req.body.namespace,
                            name: req.body.name
                        }
                    );
                }
                req.login(user, function(err) {
                    if (err) { return next(err); }
                    return next();
                });
            });

        },
        post_register:function(req, res, next){
            return next();
        },
        broadcast_register:function(req, res, next){
            //Load Super Admins

            app.njax.broadcast(
                app.njax.cache.super_admins,
                'auth.register',
                res._bootstrap,
                req.active_application.namespace
            );
            return next();
        },
        render_register:function(req, res, next){
            var redirect_url = req.query.redirect || route.redirect_uri;
            //TODO: Check domain
            return res.redirect(redirect_url);
        },
        whoami:function(req, res, next){

        }
    }
    return route;
}
