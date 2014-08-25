var async = require('async');
var _ = require('underscore');
/*
 * GET users listing.
 */
var passport = require('passport');
module.exports = function(app){

    //If Access Token Exists use it
    app.use(function(req, res, next){
        async.series([
            function(cb){
                //return next();
                if(!req.cookies['access_token'] &&  req.user){
                    //Create an access token for it
                    return app.njax.api.create_token(req.user, app.njax.config.core_app, function(err, access_token){
                        if(err) return next(err);
                        res.cookie('access_token', access_token);
                        return cb();
                    });
                }
                return cb();
            },
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
        function(req, res, next) {
            var Account =  app.model.Account;
            var user = new Account({
                email : req.body.username,
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
                    return res.redirect('/');
                });
            });

        }
    );


    app.post(
        app.njax.config.auth_url,
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login?error',
            failureFlash: true
        })
    );
    app.get(
        app.njax.config.auth_url,
        function(req, res, next){
            res.render('auth');
        }
    )

    app.get('/logout', function(req, res) {
        res.clearCookie('access_token');
        req.logout();
        res.redirect('/');
    });
}
function auth_post(req, res, next){
    return
}