
/*
 * GET users listing.
 */
var passport = require('passport');
module.exports = function(app){

    //If Access Token Exists use it
    app.use(function(req, res, next){

        //return next();
        if(!req.cookies['access_token'] &&  req.user){
            //Create an access token for it
            return app.njax.api.create_token(req.user, app.njax.config.core_app, function(err, access_token){
                if(err) return next(err);
                res.cookie('access_token', access_token);
                return next();
            });
        }
        /*if(req.cookies['access_token'] && ! req.session.user){
            //Load the user from the DB
            req.login(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/');
            });
        }*/
        return next();
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