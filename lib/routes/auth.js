
/*
 * GET users listing.
 */
var passport = require('passport');
module.exports = function(app){
    var Account =  app.model.Account;

    app.get(app.njax.config.register_url, function(req, res) {
        res.render('register', { });
    });

    app.post(app.njax.config.register_url, function(req, res) {
        Account.register(new Account({ email : req.body.email }), req.body.password, function(err, account) {
            if (err) {
                console.log(err);
                return res.render('register', { account : account, error:err });
            }

            res.redirect('/');
        });
    });


    app.post(
        app.njax.config.auth_url,
        function(req, res, next){
            req.flash = function(err){
                res.locals.error = err;

            }
            return next();
        },
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
        req.logout();
        res.redirect('/');
    });
}
function auth_post(req, res, next){
    return
}